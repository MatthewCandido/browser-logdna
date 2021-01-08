class BrowserLogdna {
    constructor(logdnaIngestionKey, logdnaHost, appName, env) {
        this.logdnaIngestionKey = logdnaIngestionKey;
        this.logdnaHost = logdnaHost;
        this.appName = appName;
        this.env = env;
    }

    registerHttpInteceptor() {
        let oldXHROpen = window.XMLHttpRequest.prototype.open;
        var logdnaIngestionKey = this.logdnaIngestionKey;
        var logdnaHost = this.logdnaHost;
        var appName = this.appName;
        var env = this.env;
        window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {            
            function ingest(message, level) {
                if (!url.includes("/api/logdna/postLog")) {
                    var xhttp = new XMLHttpRequest();
                    const targetUrl = logdnaHost + "/logs/ingest?hostname="+ window.navigator.userAgent +"&now=" + Date.now(); //&mac=C0:FF:EE:C0:FF:EE&ip=10.0.1.101
                    xhttp.open("POST", "https://mathcandido.com/api/logdna/postLog", true);
                    xhttp.setRequestHeader("auth", logdnaIngestionKey);
                    xhttp.setRequestHeader("Content-Type", "application/json");
                    const body = JSON.stringify({
                        "payload": {
                            "lines": [ 
                                { 
                                    "line": message, 
                                    "app": appName,
                                    "level": level,
                                    "env": env,
                                    "meta": {
                                        "customfield": {
                                        }
                                    }
                                }
                            ]
                        },
                        "targetUrl": targetUrl
                    });
                    xhttp.send(body);
                }
            }
        
            this.addEventListener('load', function() {
                ingest("Request " + method + " " + url + " returned a success state. Response status = " + this.status + ". Response text = " + this.responseText, "INFO");
            });

            this.addEventListener('error', function() {
                ingest("Request " + method + " " + url + " returned an error. Response status = " + this.status + ". Response text = " + this.responseText, "ERROR");
            });

            this.addEventListener('abort', function() {
                ingest("Request " + method + " " + url + " aborted. Response status = " + this.status + ". Response text = " + this.responseText, "ERROR");
            });
                        
            return oldXHROpen.apply(this, arguments);
        }
    }
}