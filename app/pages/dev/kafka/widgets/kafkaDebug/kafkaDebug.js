/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
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

angular.module('app.pages.dev.kafka.widgets.kafkaDebug', [
  'app.pages.dev.kafka.KafkaSocketService',
  'app.components.directives.dtQueryEditor'
])
  .controller('KafkaDebugCtrl', function ($scope, KafkaSocketService, GatewayAppDataService, KafkaDiscovery, clientSettings, $timeout) {
    var defaultMessage;

    if ($scope.widget.dataModelOptions && $scope.widget.dataModelOptions.query) {
      defaultMessage = $scope.widget.dataModelOptions.query;
    } else {
      defaultMessage = {
        keys: {}
      };
    }

    var kafkaQuery = defaultMessage;

    var kafkaDiscovery = $scope.kafkaDiscovery;

    if (kafkaDiscovery) {
      $scope.dimensions = kafkaDiscovery.getDimensionList();

      if (kafkaDiscovery.isKafka() && !kafkaQuery.kafka) {
        kafkaQuery = _.clone(kafkaQuery);
        angular.extend(kafkaQuery, {
          kafka: kafkaDiscovery.getKafkaTopics()
        });
      } else if (kafkaDiscovery.isGatewayWebSocket() && !kafkaQuery.gateway) {
        kafkaQuery = _.clone(kafkaQuery);
        angular.extend(kafkaQuery, {
          gateway: kafkaDiscovery.getGatewayWebSocketTopics()
        });
      }
    }

    if ($scope.kafkaService) {
      $scope.kafkaService.unsubscribe();
    }

    if (kafkaQuery.kafka) {
      $scope.kafkaService = new KafkaSocketService();
    } else {
      $scope.kafkaService = new GatewayAppDataService();
    }

    $scope.kafkaQuery = kafkaQuery;

    $scope.sendRequest = function () {
      $timeout.cancel($scope.timeout);
      $scope.timeout = $timeout(function () {
        delete $scope.kafkaMessage;
        delete $scope.kafkaMessageValue;
      }, 500); // clean results if query does not produce fast results

      if ($scope.kafkaQuery) {
        $scope.kafkaService.subscribe($scope.kafkaQuery, function (data, kafkaMessage) {
          if ($scope.timeout) {
            $timeout.cancel($scope.timeout);
            delete $scope.timeout;
          }
          $scope.kafkaMessage = _.clone(kafkaMessage);

          if (kafkaMessage) {
            var valueProperty = _.has(kafkaMessage, 'value') ? 'value' : 'data';
            var value = kafkaMessage[valueProperty];
            if (value) {
              var kafkaMessageValue = _.isString(value) ? JSON.parse(value) : value;
              $scope.kafkaMessageValue = kafkaMessageValue;
              $scope.kafkaMessage[valueProperty] = '<see data below>';
            }
          } else {
            $scope.kafkaMessageValue = null; //TODO
          }
        }, $scope);


        $scope.request = $scope.kafkaService.getQuery();
        if ($scope.widget.dataModelOptions) {
          $scope.widget.dataModelOptions.query = $scope.kafkaQuery;
          $scope.$emit('widgetChanged', $scope.widget); // persist new query
        }
      }
    };

    $scope.sendRequest();

    $scope.$on('$destroy', function () {
      $scope.kafkaService.unsubscribe();
    });
  });