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

angular.module('app.pages.config.installWizard.hadoop.InstallWizardHadoopCtrl', [
  'app.components.resources.ConfigPropertyModel',
  'app.components.resources.ConfigIssueCollection',
  'app.components.resources.HadoopLocation',
  'app.components.services.gatewayManager',
  'ui.bootstrap.modal'
])
.controller('InstallWizardHadoopCtrl', function($scope, $element, $q, $log, ConfigPropertyModel, HadoopLocation, ConfigIssueCollection, gatewayManager, $modal, $timeout) {

  // Set up models for the two properties to set
  $scope.hadoopLocation = new HadoopLocation();
  $scope.dfsLocation = new ConfigPropertyModel('dt.dfsRootDirectory');
  $scope.issues = new ConfigIssueCollection();

  // Loading
  $scope.loading = true;
  $q.all([$scope.dfsLocation.fetch(), $scope.hadoopLocation.fetch()])
    .then(
      // Successfully loaded property values
      function(){
        $scope.loading = false;

        // Set the initial values for testing
        $scope.initialValues = {
          hadoopLocation: $scope.hadoopLocation.data.value,
          dfsLocation: $scope.dfsLocation.data.value
        };

        // Focus on element
        _.defer(function() {
          // Puts focus on first text box
          // $element.find('input[name="hadoopLocation"]').focus()[0].setSelectionRange(0,9999);
          // Puts focus on next button
          $element.find('.nextButton').focus();
        });
      },
      // Failed to load properties
      function() {
        $scope.loading = false;
        $scope.loadError = true;
      }
    );

  // Continue action
  $scope.next = function() {

    // Set a model to track what is happening
    var currentAction = {
      message: 'Starting to update hadoop configuration...'
    };

    // Set up modal instance
    var $modalInstance = $modal.open({
      templateUrl: 'pages/config/installWizard/hadoop/updateHadoopConfigModal.html',
      backdrop: 'static',
      keyboard: false,
      controller: function($scope, currentAction) {
        $scope.currentAction = currentAction;
      },
      resolve: {
        currentAction: function() {
          return currentAction;
        }
      }
    });

    $scope.submittingChanges = true;

    // -------------------------------------------------
    // STEP 1: Save the hadoopLocation if it has changed
    // -------------------------------------------------
    function step1() {
    
      currentAction.message = 'Saving hadoop installation location...';
      var hadoopPromise;
      if ($scope.hadoopLocation.data.value !== $scope.initialValues.hadoopLocation) {
        hadoopPromise = $scope.hadoopLocation.save();
      }
      else {
        $log.debug('Hadoop Location was unchanged, no save required.');
        hadoopPromise = true;
      }

      var result = $q.when(hadoopPromise);

      result.then(
        function() {
          // clear server error
          $scope.hadoopLocationServerError = null;
        },
        function(response) {
          $log.warn('Failed to save new hadoop location. Response: ', response);
          $scope.hadoopLocationServerError = response.data;
        }
      );

      return result;
    }

    // ---------------------------------
    // STEP 2: Restart Gateway if needed
    // ---------------------------------
    function step2() {
      currentAction.message = 'Checking if gateway needs to be restarted...';
      // Get the issues
      return $scope.issues.fetch().then(
        function(issues) {

          // check for RESTART_NEEDED issue
          var restartPromise;
          var restartNeeded = _.find(issues, function(i) {
            return i.key === 'RESTART_NEEDED';
          });

          // If it is, trigger a restart
          if (restartNeeded) {
            $log.info('Gateway restart needed');
            currentAction.message = 'Restarting the gateway...';
            restartPromise = gatewayManager.restart();
          }
          // If it is not, create resolved promise
          else {
            $log.debug('Gateway restart was not needed.');
            restartPromise = true;
          }

          // Create promise
          var result = $q.when(restartPromise);

          result.then(
            function() {
              // Clear server error
              $scope.hadoopLocationServerError = null;
            },
            // STEP 2 FAILED: gateway failed to restart
            function(reason) {
              $log.warn('Gateway didnt restart: ', reason);
              $scope.hadoopLocationServerError = {
                message: 'The gateway could not be restarted.'
              };
            }
          );

          return result;
        },
        // STEP 2 FAILED: Issues failed to load
        function() {
          $log.warn('Issues failed to load from the gateway!');
          $scope.hadoopLocationServerError = {
            message: 'Issues could not be loaded from the gateway.'
          };
        }
      );
    }

    // -----------------------------------
    // STEP 3: Save DFS location if needed
    // -----------------------------------
    function step3() {
      
      var dfsPromise;
      currentAction.message = 'Checking if DFS location needs to be saved.';
      if ($scope.dfsLocation.data.value !== $scope.initialValues.dfsLocation) {
        currentAction.message = 'Saving DFS location...';
        dfsPromise = $scope.dfsLocation.save();  
      }
      else {
        dfsPromise = true;
      }

      var result = $q.when(dfsPromise);

      result.then(
        function() {
          // Clear error
          $scope.dfsLocationServerError = null;
        },
        function(response) {
          // Saving dfsLocation failed.
          // Check for "Permission denied" string
          // TODO: Base it on the response code
          var permissionDeniedRegExp = /permission\s+denied/i;
          if (permissionDeniedRegExp.test(response.data.message)) {
            $scope.dfsLocationServerError = {
              message: 'You do not have permission to set the DFS location to "' + $scope.dfsLocation.data.value + '".',
              stack: response.data.message
            };
          }
          else {
            $scope.dfsLocationServerError = response.data;
          }
        }
      );

      return result;
    }


    // Kick things off
    step1()
    .then(step2)
    .then(step3)
    .then(
      function() {
        $scope.submittingChanges = false;
        $modalInstance.opened.then(function() {
          currentAction.message = 'Configuration updated!';
          $timeout(function() {
            $modalInstance.close();
            $scope.goToStep('license');
          }, 1000);
        });
        
      },
      function() {
        $log.warn('Failure updating hadoop configuration.');
        $scope.submittingChanges = false;
        $timeout(function() {
          $modalInstance.close();
        }, 500);
      }
    );
    
  };

});