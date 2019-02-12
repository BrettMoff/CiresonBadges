/* ----------------------------------------------- */
/* ----------------- Script Loader --------------- */
/* ----------------------------------------------- */
// This helps with loading scripts and debugging
// Pass in the path of the js file and an array of url segments on which to run this code
// EG loadScript("/CustomSpace/CustomExtension/CustomExtension.js",["ServiceRequest","Incident"]);
var loadScript = function (path,urls) { 
	urls.forEach(function(url){	
		if(window.location.href.indexOf(url) !== -1){ // Verify we are on the valid page
		
			var result = $.Deferred(),
				script = document.createElement("script");
			script.async = "async";
			script.type = "text/javascript";
			script.src = path;
			script.onload = script.onreadystatechange = function(_, isAbort) {
				if (!script.readyState || /loaded|complete/.test(script.readyState)) {
					if (isAbort)
						result.reject();
					else
						result.resolve();
				}
			};
			script.onerror = function () { result.reject(); };
			$("head")[0].appendChild(script);
			console.log("Loaded " + path)
			return result.promise();
		}
	})
};
/* ----------------------------------------------- */
/* --------------- END Script Loader ------------- */
/* ----------------------------------------------- */

loadScript("/CustomSpace/custom_WorkItemMenuBadge.js",[""]);