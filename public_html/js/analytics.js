/* 
 * Copyright 2014 jarrod.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @ngdoc module
 * @name goog.analytics
 * @description
 *
 * # goog.analytics
 *
 * The `goog.analytics` module provides access to Google Analytics for apps.
 */
/* global -googAnalyticsModule */
var googAnalyticsModule = angular.module('goog.analytics', []).provider('analytics', $AnalyticsProvider);

/**
 * @ngdoc provider
 * @name $AnalyticsProvider
 * @function
 *
 * @description
 *
 * Used for configuring Google Analytics library.
 *
 * ## Example
 * See {@link goog.analytics.setClientId#example analytics} for an example of configuring.
 *
 * ## Dependencies
 * Requires the {@link $q `$q`} module to be installed.
 */
function $AnalyticsProvider() {
    
    //goog.require('analytics.getService');
    var service = analytics.getService('rest_client');
    var clients = [];
    ///http://googlechrome.github.io/chrome-platform-analytics/interface_analytics_Tracker.html
    var trakers = [];
    /**
     * @ngdoc method
     * @name $AnalyticsProvider#setClientId
     * 
     * @param {String|Array} clientId One clientId property or an array of properties.
     * 
     * @deprecated Set Google Analytics client(s) ID(s).
     * See https://support.google.com/analytics/answer/2614741? for more information.
     * 
     * ## Example
     * 
     * app.config(function(analyticsProvider){
     *  analyticsProvider.setClientId('UA-12345678-9');
     * });
     * 
     * @returns {undefined}
     */
    this.setClientId = function(clientId) {
        if (clients.indexOf(clientId) !== -1)
            return;
        clients.push(clientId);
        trakers.push(service.getTracker(clientId));
    };



    this.$get = ['$q', function($q) {

            var trackPageview = function(view) {
                for (var i = 0, len = trakers.length; i < len; i++) {
                    trakers[i].sendAppView(view);
                }
            };

            var trackEvent = function(category, action, label, value) {
                for (var i = 0, len = trakers.length; i < len; i++) {
                    trakers[i].sendEvent(category, action, label, value || undefined);
                }
            };

            var setEnabled = function(enabled) {
                var defered = $q.defer();
                ///http://googlechrome.github.io/chrome-platform-analytics/interface_analytics_Config.html
                service.getConfig().addCallback(function(config) {
                    config.setTrackingPermitted(enabled);
                    // If "enabled" is false the library will automatically stop
                    // sending information to Google Analytics and will persist this
                    // behavior automatically.
                    defered.resolve();
                });
                return defered.promise;
            };

            var isEnabled = function() {
                var defered = $q.defer();
                service.getConfig().addCallback(function(config) {
                    defered.resolve(config.isTrackingPermitted());
                });
                return defered.promise;
            };

            /**
             * @ngdoc angular.$provider
             * @name analytics
             * @function
             *
             * @description analytics provider object
             */
            return {
                /**
                 * @ngdoc method
                 * @name analytics.view
                 * @function
                 *
                 * @description Track pageview
                 *
                 * @params {string} view the name of the view to track
                 * @returns {undefined}
                 */
                'view': trackPageview,
                /**
                 * @ngdoc method
                 * @name analytics.event
                 * @function
                 *
                 * @description Track event
                 *
                 * @params {string} category Event's category
                 * @params {string} action Event's action
                 * @params {string} label Event's label
                 * @params {integer} value (optional) numeric value for event.
                 * 
                 * @returns {undefined}
                 */
                'event': trackEvent,
                /**
                 * @ngdoc method
                 * @name analytics.setEnabled
                 * @function
                 *
                 * @description Enable or disable analytics in this app.
                 *
                 * @params {boolean} false means analytics will stop reporting.
                 * @returns {undefined}
                 */
                'setEnabled': setEnabled,
                /**
                 * @ngdoc method
                 * @name analytics.isEnabled
                 * @function
                 *
                 * @description Check if analytics is enabled for the app.
                 *
                 * @returns {boolean}
                 */
                'isEnabled': isEnabled
            };
        }];
}