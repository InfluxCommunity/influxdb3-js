use std::io::Cursor;
use std::ops::Deref;

use arrow_array::{ArrayRef, Datum, RecordBatch, StringArray};
use arrow_cast::{cast_with_options, CastOptions};
use arrow_ipc::reader::FileReader;
use arrow_ipc::writer::FileWriter;
use arrow_schema::{Schema, SchemaRef};
use snafu::prelude::*;

use crate::error::{ArrowSnafu, Result};

#[allow(unused)]
pub(crate) fn arrow_buffer_to_record_batch(slice: &[u8]) -> Result<(Vec<RecordBatch>, SchemaRef)> {
    let mut batches: Vec<RecordBatch> = Vec::new();
    let file_reader = FileReader::try_new(Cursor::new(slice), None).context(ArrowSnafu {
        message: "failed to convert to record batch",
    })?;
    let schema = file_reader.schema().clone();
    for b in file_reader {
        let record_batch = b.context(ArrowSnafu {
            message: "failed to convert to record batch",
        })?;
        batches.push(record_batch);
    }
    Ok((batches, schema))
}

pub(crate) fn record_batch_to_buffer(batches: Vec<RecordBatch>) -> Result<Vec<u8>> {
    if batches.is_empty() {
        return Ok(Vec::new());
    }

    let schema = batches.get(0).unwrap().schema();
    let mut fr = FileWriter::try_new(Vec::new(), schema.deref()).context(ArrowSnafu {
        message: "failed to convert to buffer",
    })?;
    for batch in batches.iter() {
        fr.write(batch).context(ArrowSnafu {
            message: "failed to convert to buffer",
        })?
    }
    fr.finish().context(ArrowSnafu {
        message: "failed to convert to buffer",
    })?;
    fr.into_inner().context(ArrowSnafu {
        message: "failed to convert to buffer",
    })
}

pub(crate) fn construct_record_batch_from_params(
    params: &[(String, String)],
    parameter_schema: &Schema,
) -> Result<RecordBatch> {
    let mut items = Vec::<(&String, ArrayRef)>::new();

    for (name, value) in params {
        let field = parameter_schema.field_with_name(name).context(ArrowSnafu {
            message: "Failed reading field",
        })?;
        let value_as_array = StringArray::new_scalar(value);
        let casted = cast_with_options(
            value_as_array.get().0,
            field.data_type(),
            &CastOptions::default(),
        )
        .context(ArrowSnafu {
            message: "Failed casting field",
        })?;
        items.push((name, casted))
    }

    Ok(RecordBatch::try_from_iter(items).context(ArrowSnafu {
        message: "Failed converting fields",
    })?)
}
