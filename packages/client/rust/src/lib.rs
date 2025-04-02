#![deny(clippy::all)]

mod conversion;
mod error;
mod flight_client;

use arrow_flight::sql::client::FlightSqlServiceClient;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use snafu::prelude::*;
use tokio::sync::Mutex;
use tonic::transport::Channel;

use crate::conversion::{construct_record_batch_from_params, record_batch_to_buffer};
use crate::error::{ArrowSnafu, Result};
use crate::flight_client::{execute_flight, setup_client, ClientOptions};

#[napi]
pub struct FlightSqlClient {
    client: Mutex<FlightSqlServiceClient<Channel>>,
}

#[napi]
impl FlightSqlClient {
    #[napi]
    pub async fn query(
        &self,
        query: String,
        params: Option<Vec<(String, String)>>,
    ) -> napi::Result<Buffer> {
        let mut client = self.client.lock().await;
        let mut prepared_stmt = client.prepare(query, None).await.context(ArrowSnafu {
            message: "failed to prepare statement",
        })?;
        match params {
            Some(x) if x.is_empty() => {
                prepared_stmt
                    .set_parameters(construct_record_batch_from_params(
                        &x,
                        prepared_stmt.parameter_schema().context(ArrowSnafu {
                            message: "get parameter schema",
                        })?,
                    )?)
                    .context(ArrowSnafu {
                        message: "bind parameters",
                    })?;
            }
            None => {}
            _ => {}
        }
        let flight_info = prepared_stmt.execute().await.context(ArrowSnafu {
            message: "failed to execute prepared statement",
        })?;
        let batches = execute_flight(&mut client, flight_info).await?;
        Ok(record_batch_to_buffer(batches)?.into())
    }
}

#[napi]
pub async fn create_flight_sql_client(
    options: ClientOptions,
) -> Result<FlightSqlClient, napi::Error> {
    println!("Custom version 2");
    let setup_result = setup_client(options).await;
    match setup_result {
        Ok(client) => {
            return Ok(FlightSqlClient {
                client: Mutex::new(client),
            });
        }
        Err(e) => {
            return Err(napi::Error::from_reason(format!(
                "failed setting up flight sql client: {}",
                e.to_string()
            )));
        }
    }
    // Ok(FlightSqlClient {
    //     client: Mutex::new(setup_client(options).await.context(ArrowSnafu {
    //         message: "failed setting up flight sql client",
    //     })?),
    // })
}

#[napi]
pub fn rust_crate_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
