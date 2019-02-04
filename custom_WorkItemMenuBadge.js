/* ------------------------------------------------------- */
/* -------------- Custom WorkItem Menu Badge ------------- */
/* ------------------------------------------------------- */
/*
v7.1.2016.1
Author: Martin Blomgren, Brian Wiest, Eric Brown, Brett Moffett
Description: Adds a custom badge on the menu item counting all active work items. Refreshes every minute.

v1.1	Replace GetGridWorkItemsAll API call with GetDashboardDataById API call
v0.6 	Added comments through the code to make it easier to diagnose issues and expand
v0.5 	Added left and right badges to allow display of 2 counts on each view
v0.4 	Added badge to My Work view that shows number of Work Items that have not been updated in X days
v0.3 	Added Unassigned for Team Work
v0.2 	Fixed so badges loads on first pageload, added watch list & team requests,
		added setting to choose which badges to load, removed line when there is no items.
v0.1 	initial release


TO DO LIST:
- Replace GetGridWorkItemsMyRequests API call with GetDashboardDataById API call
- Replace GetGridWorkItemsMyGroups API call with GetDashboardDataById API call
- Replace GetGridWorkItemsByUser API call with GetDashboardDataById API call
- Replace GetGridWorkItemsAll API call with GetDashboardDataById API call
- Replace GetWatchListByUserId API call with GetDashboardDataById API call
*/
(function() {
	var myRequestsSetting = "";
	var teamWorkSetting = "";
	var teamRequestSetting = "";
	var myWorkSetting = "";
	var activeWorkSetting = "";
	var watchListSetting = "";

	//This section is used to observe the portal code loading and wait for the right pieces to load before continuing to execute.
	var badgeObserver = new MutationObserver(function (mutations) {
		var targetElement = $('#side_nav');
		if(targetElement.length > 0) {
			ApplyStyleSheetBadge(); // Add CSS
			createBadges(); // This will run on page load
			setInterval(function () {
				loadBadges() // this will run after every 60 seconds
			}, 60000);

			badgeObserver.disconnect();
		}
	});
	// Set the observer to notify me of everything!
	var observerConfig = {
		attributes: true,
		childList: false,
		characterData: false,
		subtree: true
	};
	// Now that the observer has been set we need to run the code to wait for the pieces we need to load.
	// Node, config
	$(document).ready(function () {
		var targetNode = document.getElementById('main_wrapper');
		badgeObserver.observe(targetNode, observerConfig);
	});
//*************************************************************************************************************************************************************************
	// Define the style of the badges as they appear on screen.
    function ApplyStyleSheetBadge() {
        var addRule = (function(style){
            var sheet = document.head.appendChild(style).sheet;
            return function(selector, css){
                var propText = Object.keys(css).map(function(p){
                    return p+":"+css[p]
                }).join(";");
                sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
            }
        })(document.createElement("style"));
		
		// Style that is common to ALL badges
        addRule(".menu-badge", {
            "background": "#E9001B",
            "background-image": "linear-gradient(to bottom, #00aaff, #037bb7)",
            "border": "1px solid #037bb7",
            "border-radius": "10px",
            "color": "black",
            "font-family": "Arial, sans-serif",
            "font-size": "11px",
            "font-weight": "bold",
            "line-height": "16px",
            "position": "absolute",
            "padding": "0px 5px",
            "text-shadow": "0 1px rgba(0, 0, 0, 0.25)",
            "box-shadow": "inset 0 1px rgba(255, 255, 255, 0.3), 0 1px 1px rgba(0, 0, 0, 0.08)"
        });
		
		// Style that is common to LEFT badges
		addRule(".menu-leftbadge", {
			"top": "4px",
            "left": "4px",
		});
		
		// Style that is common to RIGHT badges
		addRule(".menu-rightbadge", {
			"top": "4px",
            "right": "4px",
		});
		
		// Style that is common to Unassigned badges
        addRule(".menu-badgeunassigned", {
            "background": "#E9001B",
            "background-image": "linear-gradient(to bottom, #FF0000, #8B0000)",
            "border": "1px solid #8B0000",
			"color": "white",
        });
		
		// Style that is common to Needs Updating badges
		addRule(".menu-badgeneedsupdating", {
            "background": "#E9001B",
            "background-image": "linear-gradient(to bottom, #ff9400, #8b5100)",
            "border": "1px solid #8b5100",
			"color": "white",
        });

		addRule(".no-badge", {
			"border": "none"
        });
    }
	
//*************************************************************************************************************************************************************************
	// Create menu-badges for each of the views.
	// These can be enabled and disabled by commenting out the badges not wanted.
	var createBadges = function() {
		
		//My Requests
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=Badge-My Requests",
			type: "GET",
			async: false,
			success: function (myRequests){
				if(myRequests.Value.toUpperCase() == "TRUE") {
					$('a[href="/View/c5161e06-2378-4b44-aa89-5600e2d3b9d8"]').append('<span class="menu-badge menu-leftbadge"></span>');
					myRequestsSetting = "TRUE";
				}
			}
		});
		
		//Team Requests
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=Badge-Team Requests",
			type: "GET",
			async: false,
			success: function (teamRequests){
				if(teamRequests.Value.toUpperCase() == "TRUE") {
					$('a[href="/View/9a06b0af-2910-4783-a857-ba9e0ccb711a"]').append('<span class="menu-badge menu-leftbadge"></span>');
					var teamRequestSetting = "TRUE";
				}
			}
		});
		
		
		//My Work
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=Badge-My Work",
			type: "GET",
			async: false,
			success: function (myWork){
				if(myWork.Value.toUpperCase() == "TRUE") {
					$('a[href="/View/cca5abda-6803-4833-accd-d59a43e2d2cf"]').append('<span class="menu-badge menu-rightbadge menu-badgeneedsupdating"></span>');
					myWorkSetting = "TRUE";
				}
			}
		});
		//Team Work
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=Badge-Team Work",
			type: "GET",
			async: false,
			success: function (teamWork){
				if(teamWork.Value.toUpperCase() == "TRUE") {
					$('a[href="/View/f94d43eb-eb42-4957-8c48-95b9b903c631"]').append('<span class="menu-badge menu-leftbadge"></span>');
					$('a[href="/View/f94d43eb-eb42-4957-8c48-95b9b903c631"]').append('<span class="menu-badge menu-rightbadge menu-badgeunassigned"></span>');
					teamWorkSetting = "TRUE";
				}
			}
		});		
		
		//Active Work
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=Badge-Active Work",
			type: "GET",
			async: false,
			success: function (activeWork){
				if(activeWork.Value.toUpperCase() == "TRUE") {
					$('a[href="/View/62f452d5-66b5-429b-b2b1-b32d5562092b"]').append('<span class="menu-badge menu-leftbadge"></span>');
					myWorkSetting = "TRUE";
				}
			}
		});
				
		//Watch List
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=Badge-Watch List",
			type: "GET",
			async: false,
			success: function (watchList){
				if(watchList.Value.toUpperCase() == "TRUE") {
					$('a[href="/Page/71dab6bd-ba26-4f14-a724-156dff8d5de8"]').append('<span class="menu-badge menu-leftbadge"></span>');
					watchListSetting = "TRUE";
				}
			}
		});
		
		// Load data to badges
		loadBadges();
	}

	
//*************************************************************************************************************************************************************************	
	// Here we use API calls to get work item count from each of the views we want to create badges on.
	var loadBadges = function() {
		//My Requests View
		if(myRequestsSetting == "TRUE") {
			$.getJSON('/api/V3/WorkItem/GetGridWorkItemsMyRequests', 
			{ 
			"userId": session.user.Id,
			"showInactiveItems": false 
			},
			// Show a badge with just a count of the WI's in this view
			function (data) {
				var badge = $('a[href="/View/c5161e06-2378-4b44-aa89-5600e2d3b9d8"] .menu-badge');
				if (data.length > 0) {
					badge.removeClass('no-badge');
					badge.text(data.length);
				} else {
					badge.addClass('no-badge');
					badge.text('');
				}
			})
		}

		//Team Work View
		if(teamWorkSetting == "TRUE") {
			
			$.getJSON('/api/V3/WorkItem/GetGridWorkItemsMyGroups', 
			{ 
			"userId": session.user.Id,
			"isScoped": false,
			"showActivities": true,
			"showInactiveItems": false 
			}, 
			function (data) {
				// Show a badge with just a count of the WI's in this view.
				// If no WI's in this view, hide the badge.
				var badge = $('a[href="/View/f94d43eb-eb42-4957-8c48-95b9b903c631"] .menu-badge');
				if (data.length > 0) {
					badge.removeClass('no-badge');
					badge.text(data.length);
				} else {
					badge.addClass('no-badge');
					badge.text('');
				}
							
				// Find the number of WI's in this view that are unassigned
				var unassigned = 0;
				for (var x = 0; x < data.length; x++) {
				    // If the data returned has ANY value in the AssignedUser property, ignore it.
					if (data[x].AssignedUser) {
				    } else {
						// If the data returned has NO value in the AssignedUser property, add it to the unassigned variable.
				        unassigned++;
				    }
				}

				// Show a second badge with a count of the WI's that are unassigned
				// If no WI's are unassigned in this view, hide the badge.
				var badge2 = $('a[href="/View/f94d43eb-eb42-4957-8c48-95b9b903c631"] .menu-badgeunassigned');
				if (unassigned > 0) {
				    badge2.removeClass('no-badge');
				    badge2.text(unassigned);
				} else {
				    badge2.addClass('no-badge');
				    badge2.text('');
				}
			});
		}

		//My Work View
		if(myWorkSetting == "TRUE") {
					
			//Execute a SQL query to return all WI's that are active.
			//console.log("Run GetDashboardDataById API call for MyWork");
			$.ajax({
				url: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter" + "&queryId=6DAF2352-3661-A776-47FB-9EE52BC47881",
				type: "GET",
				async: false,
				success: function (data) {
					// Show a badge with just a count of the WI's in this view.
					// If no WI's in this view, hide the badge.
					var badge = $('a[href="/View/cca5abda-6803-4833-accd-d59a43e2d2cf"] .menu-badge');
					if (data.length > 0) {
						badge.removeClass('no-badge');
						badge.text(data.length);
					} else {
						badge.addClass('no-badge');
						badge.text('');
					}
					
					// Find the number of WI's in this view that have not been updated in 3 days.
					// NOTE: In future it would be good to get this value from a setting in the portal.
					var mawiNeedUpdating = 0;
					var datToday = new Date();
					var intXDaysAgo = datToday.setDate(datToday.getDate() -3);
					var datDaysAgo = new Date(intXDaysAgo);
					for (var x = 0; x < data.length; x++) {
						// If the data returned has a last modified date GREATER than X days ago, ignore it.
						if (Date.parse(data[x].LastModified) > datDaysAgo ) {
						} 
						else {
							// If the data returned has a last modified date LESS than X days ago, add it to the Needs Updating variable.
							//console.log(data[x].LastModified);
							mawiNeedUpdating++;
						}
					}
					
					// Show a second badge with a count of the WI's that are not updated in x days
					// If no WI's need updating in this view, hide the badge.
					var badge2 = $('a[href="/View/cca5abda-6803-4833-accd-d59a43e2d2cf"] .menu-badgeunassigned');
					if (mawiNeedUpdating > 0) {
						badge2.removeClass('no-badge');
						badge2.text(mawiNeedUpdating);
					}
					else {
						badge2.addClass('no-badge');
						badge2.text('');
					}
				}		
			});
		}
		else {
			var badge = $('a[href="/View/cca5abda-6803-4833-accd-d59a43e2d2cf"] .menu-badge');
			badge.addClass('no-badge');
			badge.text('');
		};

		//Active Work View
		if(activeWorkSetting == "TRUE") {
			
			//Execute a SQL query to return all WI's that are active.
			$.ajax({
				url: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter" + "&queryId=A1FDBF16-7A53-D471-4893-0CA219483B0F",
				type: "GET",
				async: false,
				success: function (data) {
					// Show a badge with just a count of the WI's in this view.
					// If no WI's in this view, hide the badge.
					var badge = $('a[href="/View/62f452d5-66b5-429b-b2b1-b32d5562092b"] .menu-badge');
					if (data.length > 0) {
						badge.removeClass('no-badge');
						badge.text(data.length);
					} 
					else {
						badge.addClass('no-badge');
						badge.text('');
					}
				}
			});
		};

		//Watch List View
		if(watchListSetting == "TRUE") {
			$.getJSON('/api/V3/WorkItem/GetWatchListByUserId', 
			{ 
			"userId": session.user.Id 
			}, 
			function (data) {
				// Show a badge with just a count of the WI's in this view.
				// If no WI's in this view, hide the badge.
				var badge = $('a[href="/Page/71dab6bd-ba26-4f14-a724-156dff8d5de8"] .menu-badge');
				if (data.length > 0) {
					badge.removeClass('no-badge');
					badge.text(data.length);
				} else {
					badge.addClass('no-badge');
					badge.text('');
				}
			});
		}
	}


})();
/* ------------------------------------------------------- */
/* -----------End Custom WorkItem Menu Badge ------------- */
/* ------------------------------------------------------- */
