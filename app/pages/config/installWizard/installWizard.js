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

angular.module('app.pages.config.installWizard', [
  // Controllers
  'app.pages.config.installWizard.welcome.InstallWizardWelcomeCtrl',
  'app.pages.config.installWizard.hadoop.InstallWizardHadoopCtrl',
  'app.pages.config.installWizard.license.InstallWizardLicenseCtrl',
  'app.pages.config.installWizard.license.InstallWizardLicenseUploadCtrl',
  'app.pages.config.installWizard.summary.InstallWizardSummaryCtrl',

  // Directives
  'app.components.directives.viewRawInModal'
])
// Routing
.config(function(settings, $routeProvider) {

  $routeProvider.when(settings.pages.InstallWizard, {
    controller: 'InstallWizardCtrl',
    templateUrl: 'pages/config/installWizard/installWizard.html',
    label: 'Installation Wizard'
  });

})

.factory('installWizardSteps', function(dtText) {
  // linked list
  return {
    welcome: {
      label: dtText.get('Welcome'),
      templateUrl: 'pages/config/installWizard/welcome/welcome.html',
      next: 'hadoop'
    },
    hadoop: {
      label: dtText.get('Hadoop'),
      templateUrl: 'pages/config/installWizard/hadoop/hadoop.html',
      next: 'license',
      prev: 'welcome'
    },
    license: {
      label: dtText.get('License'),
      templateUrl: 'pages/config/installWizard/license/license.html',
      next: 'summary',
      prev: 'hadoop'
    },
    licenseUpload: {
      label: dtText.get('License'),
      templateUrl: 'pages/config/installWizard/license/licenseUpload.html',
      prev: 'license'
    },
    summary: {
      label: dtText.get('Summary'),
      templateUrl: 'pages/config/installWizard/summary/summary.html',
      prev: 'license'
    }
  };
})

// Controller
.controller('InstallWizardCtrl', function($scope, installWizardSteps, dtText) {

  // Holds the current step
  $scope.currentStep = installWizardSteps.welcome;

  // Changes to step
  $scope.goToStep = function(step) {
    $scope.currentStep = installWizardSteps[step];    
  };

  // Step order
  $scope.stepOrder = [dtText.get('Welcome'), dtText.get('Hadoop'), dtText.get('License'), dtText.get('Summary')];

});