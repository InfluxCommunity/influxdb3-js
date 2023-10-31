declare global {
    namespace NodeJS {
        interface ProcessEnv {
            INFLUX_HOST: string;
            INFLUX_TOKEN: string;
            INFLUX_DATABASE: string;
            INFLUX_TIMEOUT: number;
            INFLUX_PRECISION: string;
            INFLUX_GZIP_THRESHOLD: number;
            ENV: 'test' | 'dev' | 'prod';
        }
    }
}

export {}