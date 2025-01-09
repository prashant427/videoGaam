class apiError {    
    constructor(
        statusCode ,
        message = "api error something went wrong",
        errors = [],
        statck = ""


    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.sucess = false;
        this.errors = errors;

        if (statck){
            this.statck = statck;   
        } else{
            Error.captureStackTrace(this, this.constructor);
        }
        
    }
}
export { apiError };
