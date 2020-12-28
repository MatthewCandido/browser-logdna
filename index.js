class BrowserLogdna {
    constructor({logdnaIngestionKey, logdnaHost, appName, env}) {
        this.logdnaIngestionKey = logdnaIngestionKey;
        this.logdnaHost = logdnaHost;
        this.appName = appName;
        this.env = env;
    }

    registerHttpInteceptor({message}) {
        let oldXHROpen = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        
            this.addEventListener('load', function() {
                // do something with the response text
                console.log('load: ' + this.responseText);
                ingest("Request " + method + " " + url + " returned a success state. Response text = " + this.responseText, "INFO");
            });

            this.addEventListener('error', function() {
                // do something with the response text
                console.log('error: ' + this.responseText);
                ingest("Request " + method + " " + url + " returned an error. Response text = " + this.responseText, "ERROR");
            });

            this.addEventListener('abort', function() {
                // do something with the response text
                console.log('abort: ' + this.responseText);
                ingest("Request " + method + " " + url + " aborted. Response text = " + this.responseText, "ERROR");
            });
                        
            return oldXHROpen.apply(this, arguments);
        }
    }

    ingest(message, level) {
        var xhttp = new XMLHttpRequest();
        const targetUrl = logdnaHost.replace("/", "") + "/logs/ingest?hostname="+ window.navigator.userAgent +"&now=" + Date.now(); //&mac=C0:FF:EE:C0:FF:EE&ip=10.0.1.101
        xhttp.open("POST", targetUrl, true);
        xhttp.setRequestHeader("Authorization", "Basic " + logdnaIngestionKey);
        const body = {
            "lines": [ 
                { 
                    "line": message, 
                    "app": this.appName,
                    "level": level,
                    "env": this.env,
                    "meta": {
                        "customfield": {
                        }
                    }
                }
            ]
        }
        xhttp.send(body);
    }
}

module.exports = new BrowserLogdna({logdnaIngestionKey, logdnaHost, appName, env});