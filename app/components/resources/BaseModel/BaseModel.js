/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict';

/**
 * Base Model
 *
 * The base model class for other model resources.
 * Subclasses can be created with the following:
 *
 * ```
 * angular.module('app.components.resources.MySubModel')
 * .factory('MySubModel', function(BaseModel) {
 *   var MySubModel = BaseModel.extend({
 *   
 *     urlKey: '[URL_KEY_IN_SETTINGS]',
 *     
 *     topicKey: '[TOPIC_KEY_IN_SETTINGS]', // optional
 *     
 *     idAttribute: 'myId' // optional: only necessary if resource is  
 *                         // identified by a key other than "id"
 *   });
 *   return MySubModel;
 * })
 * ```
 */

angular.module('app.components.resources.BaseModel', [
  'app.components.services.getUri',
  'app.components.resources.BaseResource'
])
.factory('BaseModel', function(getUri, BaseResource) {

  // Abstract BaseModel class
  var BaseModel = BaseResource.extend({

    /**
     * Constructor for models. 
     * 
     * @param  {object|String|number} params  Parameters to be used when interpolating
     *                                        url or topic URIs. Can also be this.idAttribute, 
     *                                        i.e. string or number.
     */
    constructor: function (params) {
      this.data = {};
      this.updateParams(params);
    },

    /**
     * Updates the parameters used for url and topic interpolation.
     * Sets this.url based on this.urlKey and the passed
     * params object and id object. Used by this.constructor
     * but is also useful when this.url has to be updated
     * after instantiation.
     * 
     * Expects this.urlKey and/or this.topicKey
     * to be defined in a subclass.
     * 
     * @param  {object|String|number} params  Parameters to be used when interpolating
     *                                        url or topic URIs. Can also be this.idAttribute, 
     *                                        i.e. string or number.
     */
    updateParams: function(params) {
      var id;

      var argType = typeof params;

      if (argType === 'string' || argType === 'number') {
        id = params;
        params = {};
      }

      if ( typeof params === 'object' && params.hasOwnProperty(this.idAttribute) && !this.doNotAppendIdAttribute) {
        id = params[this.idAttribute];
      }

      this.url = getUri.url(this.urlKey, params, id);

      if (this.topicKey) {
        this.topic = getUri.topic(this.topicKey, params);
      }

      _.extend(this, params);
    },

    /**
     * Called when new data from the server comes in, e.g. from fetch or webSocket.
     * If this is a websocket message and a scope was supplied to the subscribe
     * function, scope.$apply() will be called AFTER this function is executed.
     * 
     * @param  {object} data  The transformed data from the server.
     */
    set: function(data) {
      _.extend(this.data, data);
    },

    debugName: 'model',

    idAttribute: 'id'

  });

  return BaseModel;

});