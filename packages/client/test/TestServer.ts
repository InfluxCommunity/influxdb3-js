import * as fsv from './generated/flight/Flight.grpc-server'
import * as grpc from '@grpc/grpc-js'
import * as flt from '../src/generated/flight/Flight'
import {MetadataVersion} from 'apache-arrow/fb/metadata-version'
import {FieldNode, Message} from 'apache-arrow/ipc/metadata/message'
import {MessageHeader} from 'apache-arrow/fb/message-header'
import {Schema} from 'apache-arrow/Arrow.node'
import {Log, setLogger, consoleLogger} from '../src'

setLogger({
  error(message: string, error) {
    consoleLogger.error(message, error)
  },
  warn(message: string, error) {
    consoleLogger.warn(message, error)
  },
})

const DEFAULT_PORT = 44404
export class MockService {
  static callMeta: Map<string, Map<string, string[]>> = new Map()
  static callTickets: Map<string, flt.Ticket> = new Map()
  static defaultBlobSize = 65536

  static callCount: {[key: string]: any} = {
    doAction: 0,
    doExchange: 0,
    doGet: 0,
    doPut: 0,
    getFlightInfo: 0,
    getSchema: 0,
    handshake: 0,
    listActions: 0,
    listFlights: 0,
    pollFlightInfo: 0,
  }

  public static genCallId(methodName: string, count: number): string {
    return `${methodName}${String(count).padStart(3, '0')}`
  }

  public static resetCallCount(): void {
    for (const key of Object.keys(this.callCount)) {
      this.callCount[key] = 0
    }
  }

  public static resetCallMeta(): void {
    this.callMeta = new Map()
  }

  public static resetCallTickets(): void {
    this.callTickets = new Map()
  }

  public static getCallMeta(
    callId: string,
    metaKey: string
  ): string[] | undefined {
    const callMap = this.callMeta.get(callId)
    if (callMap == null) {
      return undefined
    }
    return callMap.get(metaKey)
  }

  public static getCallTicket(callId: string): flt.Ticket | undefined {
    return this.callTickets.get(callId)
  }

  public static getCallTicketDecoded(callId: string): any | undefined {
    const decoder = new TextDecoder()
    const ticket = this.getCallTicket(callId)
    if (ticket) {
      return JSON.parse(decoder.decode(ticket.ticket))
    }
    return undefined
  }

  public static resetAll(): void {
    this.resetCallCount()
    this.resetCallMeta()
    this.resetCallTickets()
  }

  public static sendEmptySchema(
    call: grpc.ServerWritableStream<flt.Ticket, flt.FlightData>
  ): void {
    call.write(
      {
        flight_descriptor: {
          type: 2,
          path: call.getPath(),
        },
        dataHeader: Message.encode(
          new Message(0, MetadataVersion.V5, MessageHeader.Schema, new Schema())
        ),
        appMetadata: new Uint8Array(0),
        dataBody: new Uint8Array(0),
      } as flt.FlightData,
      (err: Error) => {
        if (err) {
          Log.error.call(Log, `Failed to send Empty Schema`, err)
        }
      }
    )
  }

  /*
   FYI - dataHeader in FlightData needs to match Message.fsb :: Message in project Arrow - arrow/format

   table Message {
       version: org.apache.arrow.flatbuf.MetadataVersion;
       header: MessageHeader; // n.b. ideally should be RecordBatch
       bodyLength: long;
       custom_metadata: [ KeyValue ];
   }

   table RecordBatch {
      length: long // number of records/rows
      nodes: [FieldNode]
      buffers: [Buffer]
      compression: BodyCompression // optional
      variadicBufferCounts: [long] // optional
   }
 */

  public static sendEmptyResponseBody(
    call: grpc.ServerWritableStream<flt.Ticket, flt.FlightData>,
    path: string
  ): void {
    call.write(
      {
        flight_descriptor: {
          type: 2,
          path: path,
        },
        dataHeader: Message.encode(
          new Message(0, MetadataVersion.V5, MessageHeader.RecordBatch, {
            length: 1,
            nodes: [new FieldNode(0, 0)],
            buffers: [{offset: 0, length: 0}],
            compression: null,
          })
        ),
        appMetadata: new Uint8Array(0),
        dataBody: new Uint8Array(0),
      } as flt.FlightData,
      (err: Error) => {
        if (err) {
          Log.error.call(Log, `Failed to write empty response body`, err)
        }
      }
    )
  }

  public static sendMetadata(
    call: grpc.ServerWritableStream<flt.Ticket, flt.FlightData>,
    metaItems: {key: string; value: string}[]
  ): void {
    const metadata = new grpc.Metadata()
    for (const item of metaItems) {
      metadata.set(item.key, item.value)
    }
    call.sendMetadata(metadata)
  }

  public static echoMetadata(
    call: grpc.ServerWritableStream<flt.Ticket, flt.FlightData>,
    metadata: grpc.Metadata
  ): void {
    call.sendMetadata(metadata)
  }

  public static pushCallMetadata(
    callId: string,
    call: {metadata: grpc.Metadata}
  ): void {
    const mData: Map<string, string[]> = new Map()
    for (const key of Object.keys(call.metadata.getMap())) {
      const values: string[] = []
      for (const value of call.metadata.get(key)) {
        values.push(value.toString())
      }
      mData.set(key, values)
    }
    this.callMeta.set(callId, mData)
  }

  public static pushCallTicket(callId: string, ticket: flt.Ticket): void {
    this.callTickets.set(callId, ticket)
  }

  public static handleBlob(
    call: grpc.ServerWritableStream<flt.Ticket, flt.FlightData>,
    size: number
  ): void {
    const data = new Uint8Array(size)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.floor(Math.random() * 96) + 32
    }
    const decoder = new TextDecoder('utf-8')
    const dataB64 = btoa(decoder.decode(data))
    const fd = flt.FlightData.fromJsonString(`{ "dataBody": "${dataB64}" }`)
    call.write(fd)
  }

  public static service: fsv.IFlightService = {
    doAction(call: grpc.ServerWritableStream<flt.Action, flt.Result>): void {
      MockService.callCount.doAction++
      MockService.pushCallMetadata(
        MockService.genCallId('doAction', MockService.callCount.doAction),
        call
      )
    },
    doExchange(
      call: grpc.ServerDuplexStream<flt.FlightData, flt.FlightData>
    ): void {
      MockService.callCount.doExchange++
      MockService.pushCallMetadata(
        MockService.genCallId('doExchange', MockService.callCount.doExchange),
        call
      )
    },
    doGet(call: grpc.ServerWritableStream<flt.Ticket, flt.FlightData>): void {
      let timeout = 0
      MockService.callCount.doGet++
      MockService.pushCallMetadata(
        MockService.genCallId('doGet', MockService.callCount.doGet),
        call
      )
      MockService.pushCallTicket(
        MockService.genCallId('doGet', MockService.callCount.doGet),
        call.request
      )
      call.on('error', (args) => {
        Log.error.call(Log, `MockService ERROR on doGet() ${args}`)
      })

      const metadata = call.metadata
      const path = call.getPath()

      if (metadata.get('sendblob').length > 0) {
        let blobSize = Number.parseInt(metadata.get('sendblob').toString())
        blobSize =
          Number.isNaN(blobSize) || blobSize < 1
            ? MockService.defaultBlobSize
            : blobSize
        MockService.handleBlob(call, blobSize)
      } else {
        // echo metadata back
        MockService.echoMetadata(call, metadata)
        // Send empty responses
        // Send Schema
        MockService.sendEmptySchema(call)
        // Send ResponseBody
        MockService.sendEmptyResponseBody(call, path)
      }

      if (metadata.get('delay').length > 0) {
        timeout = Number.parseInt(metadata.get('delay').toString())
      }
      setTimeout(() => {
        call.end(metadata)
      }, timeout)
    },
    doPut(call: grpc.ServerDuplexStream<flt.FlightData, flt.PutResult>): void {
      MockService.callCount.doPut++
      MockService.pushCallMetadata(
        MockService.genCallId('doPut', MockService.callCount.doPut),
        call
      )
    },
    getFlightInfo(
      call: grpc.ServerUnaryCall<flt.FlightDescriptor, flt.FlightInfo>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: grpc.sendUnaryData<flt.FlightInfo>
    ): void {
      MockService.callCount.getFlightInfo++
      MockService.pushCallMetadata(
        MockService.genCallId(
          'getFlightInfo',
          MockService.callCount.getFlightInfo
        ),
        call
      )
    },
    getSchema(
      call: grpc.ServerUnaryCall<flt.FlightDescriptor, flt.SchemaResult>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: grpc.sendUnaryData<flt.SchemaResult>
    ): void {
      MockService.callCount.getSchema++
      MockService.pushCallMetadata(
        MockService.genCallId('getSchema', MockService.callCount.getSchema),
        call
      )
    },
    handshake(
      call: grpc.ServerDuplexStream<flt.HandshakeRequest, flt.HandshakeResponse>
    ): void {
      MockService.callCount.handshake++
      MockService.pushCallMetadata(
        MockService.genCallId('handshake', MockService.callCount.handshake),
        call
      )
    },
    listActions(
      call: grpc.ServerWritableStream<flt.Empty, flt.ActionType>
    ): void {
      MockService.callCount.listActions++
      MockService.pushCallMetadata(
        MockService.genCallId('listActions', MockService.callCount.listActions),
        call
      )
    },
    listFlights(
      call: grpc.ServerWritableStream<flt.Criteria, flt.FlightInfo>
    ): void {
      MockService.callCount.listFlights++
      MockService.pushCallMetadata(
        MockService.genCallId('listFlights', MockService.callCount.listFlights),
        call
      )
    },
    pollFlightInfo(
      call: grpc.ServerUnaryCall<flt.FlightDescriptor, flt.PollInfo>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: grpc.sendUnaryData<flt.PollInfo>
    ): void {
      MockService.callCount.pollFlightInfo++
      MockService.pushCallMetadata(
        MockService.genCallId(
          'pollFlightInfo',
          MockService.callCount.pollFlightInfo
        ),
        call
      )
    },
  }
}

/*
    Since this is to be used only for testing for now use insecure
    todo - implement security - should be able to check TLS
 */
export class TestServer {
  service: fsv.IFlightService
  port: number

  server: grpc.Server

  constructor()

  constructor(svc: fsv.IFlightService)

  constructor(port: number)

  constructor(...args: Array<any>) {
    switch (args.length) {
      case 0:
        this.service = MockService.service
        this.port = DEFAULT_PORT
        break
      case 1:
        if (args[0] == null) {
          throw Error('Attempt to create null service')
        }
        if (typeof args[0] == 'number') {
          this.port = args[0]
        } else {
          // todo add type guard
          this.service = args[0]
        }
        break
      default:
        throw Error(`Unsupported arguments in ${args}`)
    }
    this.server = new grpc.Server()
  }

  start = async (): Promise<void> => {
    await this.server.addService(fsv.flightServiceDefinition, this.service)
    await this.server.bindAsync(
      `0.0.0.0:${this.port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          Log.error.call(Log, `Failed to start server: ${err}`)
          return Promise.reject(err)
        } else {
          Log.warn.call(Log, `Server start: ${port}`)
        }
      }
    )
    return Promise.resolve()
  }

  shutdown = async (): Promise<void> => {
    await this.server.tryShutdown((err) => {
      if (err) {
        Log.error.call(Log, `Failed to shutdown server:`, err)
        return Promise.reject(err)
      }
    })
    Log.warn.call(Log, `Server shutdown`)
    return Promise.resolve()
  }
}
