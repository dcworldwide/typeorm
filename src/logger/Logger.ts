import { LoggerOptions } from "./LoggerOptions";
import { PlatformTools } from "../platform/PlatformTools";

/**
 * Performs logging of the events in TypeORM.
 */
export class Logger {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private options: LoggerOptions) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Logs query and parameters used in it.
     */
    logQuery(query: string, parameters?: any[]) {
        if (this.options.logQueries || PlatformTools.getEnvVariable("LOGGER_CLI_SCHEMA_SYNC")) {
            this.log("log", `executing query: ${query}${parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : ""}`);
        }
    }

    /**
     * Logs query that failed.
     */
    logFailedQuery(query: string, parameters?: any[]) {
        if (this.options.logQueries ||
            this.options.logOnlyFailedQueries ||
            PlatformTools.getEnvVariable("LOGGER_CLI_SCHEMA_SYNC"))
            this.log("error", `query failed: ${query}${parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : ""}`);
    }

    /**
     * Logs failed query's error.
     */
    logQueryError(error: any) {
        if (this.options.logFailedQueryError ||
            PlatformTools.getEnvVariable("LOGGER_CLI_SCHEMA_SYNC"))
            this.log("error", "error during executing query:" + error);
    }

    /**
     * Logs events from the schema build process.
     */
    logSchemaBuild(message: string) {
        if (this.options.logSchemaCreation ||
            PlatformTools.getEnvVariable("LOGGER_CLI_SCHEMA_SYNC"))
            this.log("info", message);
    }

    /**
     * Perform logging using given logger, or by default to the console.
     * Log has its own level and message.
     */
    log(level: "log" | "info" | "warn" | "error", message: any) {
        if (!this.options) return;

        if (this.options.logger) {
            this.options.logger(level, message);
        } else {
            switch (level) {
                case "log":
                    console.log(message);
                    break;
                case "info":
                    console.info(message);
                    break;
                case "warn":
                    console.warn(message);
                    break;
                case "error":
                    console.error(message);
                    break;
            }
        }
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Converts parameters to a string.
     * Sometimes parameters can have circular objects and therefor we are handle this case too.
     */
    protected stringifyParams(parameters: any[]) {
        try {
            return JSON.stringify(parameters);

        } catch (error) { // most probably circular objects in parameters
            return parameters;
        }
    }

}