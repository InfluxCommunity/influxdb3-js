use std::{sync::Arc, time::Duration};

use arrow_array::RecordBatch;
use arrow_flight::{sql::client::FlightSqlServiceClient, FlightInfo};
use arrow_schema::{ArrowError, Schema};
use futures::TryStreamExt;
use napi_derive::napi;
use snafu::ResultExt;
use tonic::transport::{Channel, ClientTlsConfig, Endpoint};
use tracing_log::log::{debug, info};

use crate::error::{ArrowSnafu, Error, FlightSnafu, Result};

/// A ':' separated key value pair
#[derive(Debug, Clone)]
#[napi(object)]
pub struct KeyValue {
    pub key: String,
    pub value: String,
}

#[derive(Debug)]
#[napi(object)]
pub struct ClientOptions {
    /// Additional headers.
    ///
    /// Values should be key value pairs separated by ':'
    pub headers: Vec<KeyValue>,

    /// Username
    pub username: Option<String>,

    /// Password
    pub password: Option<String>,

    /// Auth token.
    pub token: Option<String>,

    /// Server host.
    pub host: String,
}

pub(crate) async fn execute_flight(
    client: &mut FlightSqlServiceClient<Channel>,
    info: FlightInfo,
) -> Result<Vec<RecordBatch>> {
    let schema = Arc::new(Schema::try_from(info.clone()).context(ArrowSnafu {
        message: "creating schema from flight info",
    })?);
    let mut batches = Vec::with_capacity(info.endpoint.len() + 1);
    batches.push(RecordBatch::new_empty(schema));

    debug!("decoded schema");

    for endpoint in info.endpoint {
        let Some(ticket) = &endpoint.ticket else {
            return Err(Error::Arrow {
                source: ArrowError::InvalidArgumentError("No RecordBatches to process".to_string()),
                message: "No RecordBatches to process",
            });
        };
        let flight_data = client.do_get(ticket.clone()).await.context(ArrowSnafu {
            message: "do_get_request",
        })?;
        let mut flight_data: Vec<_> = flight_data
            .try_collect()
            .await
            .context(FlightSnafu {
                message: "collect data stream",
            })
            .expect("collect data stream");
        batches.append(&mut flight_data);
    }

    debug!("received data");

    Ok(batches)
}

#[allow(unused)]
fn setup_logging() {
    tracing_log::LogTracer::init().expect("tracing log init");
    tracing_subscriber::fmt::init();
}

pub(crate) async fn setup_client(
    args: ClientOptions,
) -> Result<FlightSqlServiceClient<Channel>, ArrowError> {
    let tls = args.host.to_lowercase().starts_with("https://");

    let mut endpoint = Endpoint::new(args.host)
        .map_err(|err| ArrowError::ExternalError(Box::new(err)))?
        .connect_timeout(Duration::from_secs(20))
        .timeout(Duration::from_secs(20))
        .tcp_nodelay(true) // Disable Nagle's Algorithm since we don't want packets to wait
        .tcp_keepalive(Option::Some(Duration::from_secs(3600)))
        .http2_keep_alive_interval(Duration::from_secs(300))
        .keep_alive_timeout(Duration::from_secs(20))
        .keep_alive_while_idle(true);

    if tls {
        let tls_config = ClientTlsConfig::new().with_enabled_roots();
        endpoint = endpoint
            .tls_config(tls_config)
            .map_err(|err| ArrowError::ExternalError(Box::new(err)))?;
    }

    let channel_res = endpoint.connect().await;

    let channel = match channel_res {
        Ok(channel) => channel,
        Err(err) => {
            println!("lib: Error connecting to endpoint: {:?}", err);
            return Err(ArrowError::ExternalError(Box::new(err)));
        }
    };

    let mut client = FlightSqlServiceClient::new(channel);

    for kv in args.headers {
        client.set_header(kv.key, kv.value);
    }

    if let Some(token) = args.token {
        client.set_token(token);
    }

    match (args.username, args.password) {
        (None, None) => {}
        (Some(username), Some(password)) => {
            client
                .handshake(&username, &password)
                .await
                .expect("handshake");
            info!("performed handshake");
        }
        (Some(_), None) => {
            panic!("when username is set, you also need to set a password")
        }
        (None, Some(_)) => {
            panic!("when password is set, you also need to set a username")
        }
    }

    Ok(client)
}
