// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { TimeUnit } from '../../../../org/apache/arrow/flatbuf/time-unit';


export class Duration {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Duration {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsDuration(bb:flatbuffers.ByteBuffer, obj?:Duration):Duration {
  return (obj || new Duration()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsDuration(bb:flatbuffers.ByteBuffer, obj?:Duration):Duration {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Duration()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

unit():TimeUnit {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt16(this.bb_pos + offset) : TimeUnit.MILLISECOND;
}

static startDuration(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addUnit(builder:flatbuffers.Builder, unit:TimeUnit) {
  builder.addFieldInt16(0, unit, TimeUnit.MILLISECOND);
}

static endDuration(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createDuration(builder:flatbuffers.Builder, unit:TimeUnit):flatbuffers.Offset {
  Duration.startDuration(builder);
  Duration.addUnit(builder, unit);
  return Duration.endDuration(builder);
}
}