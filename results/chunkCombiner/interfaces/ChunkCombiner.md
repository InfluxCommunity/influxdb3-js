[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [results/chunkCombiner](../index.md) / ChunkCombiner

# Interface: ChunkCombiner

ChunkCombiner is a simplified platform-neutral manipulation of Uint8arrays
that allows to process text data on the fly. The implementation can be optimized
for the target platform (node vs browser).

## Methods

### concat()

> **concat**(`first`, `second`): `Uint8Array`\<`ArrayBufferLike`\>

Concatenates first and second chunk.

#### Parameters

##### first

`Uint8Array`\<`ArrayBufferLike`\>

first chunk

##### second

`Uint8Array`\<`ArrayBufferLike`\>

second chunk

#### Returns

`Uint8Array`\<`ArrayBufferLike`\>

first + second

#### Defined in

[packages/client/src/results/chunkCombiner.ts:13](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/chunkCombiner.ts#L13)

***

### copy()

> **copy**(`chunk`, `start`, `end`): `Uint8Array`\<`ArrayBufferLike`\>

Creates a new chunk from the supplied chunk.

#### Parameters

##### chunk

`Uint8Array`\<`ArrayBufferLike`\>

chunk to copy

##### start

`number`

start index

##### end

`number`

end index

#### Returns

`Uint8Array`\<`ArrayBufferLike`\>

a copy of a chunk slice

#### Defined in

[packages/client/src/results/chunkCombiner.ts:31](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/chunkCombiner.ts#L31)

***

### toUtf8String()

> **toUtf8String**(`chunk`, `start`, `end`): `string`

Converts chunk into a string.

#### Parameters

##### chunk

`Uint8Array`\<`ArrayBufferLike`\>

chunk

##### start

`number`

start index

##### end

`number`

end index

#### Returns

`string`

string representation of chunk slice

#### Defined in

[packages/client/src/results/chunkCombiner.ts:22](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/chunkCombiner.ts#L22)
