// ============================================================
// WINX DIGITAL SOLUTIONS — Admin Login Controller
// ============================================================

var adminLoginApp = angular.module('winxAdminApp', []);

adminLoginApp.controller('LoginController', function ($scope, $window) {

  $scope.credentials = { email: '', password: '' };
  $scope.loginError  = '';
  $scope.loggingIn   = false;
  $scope.showPass    = false;

  // If already logged in, redirect to dashboard
  auth.onAuthStateChanged(function (user) {
    if (user) {
      $window.location.href = 'dashboard.html';
    }
  });

  // ===== LOGIN =====
  $scope.login = function () {
    if (!$scope.credentials.email || !$scope.credentials.password) {
      $scope.loginError = 'Please enter your email and password.';
      return;
    }

    $scope.loggingIn  = true;
    $scope.loginError = '';

    auth.signInWithEmailAndPassword(
      $scope.credentials.email,
      $scope.credentials.password
    )
    .then(function () {
      $window.location.href = 'dashboard.html';
    })
    .catch(function (error) {
      $scope.loggingIn = false;

      // User-friendly error messages
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          $scope.loginError = 'Incorrect email or password. Please try again.';
          break;
        case 'auth/too-many-requests':
          $scope.loginError = 'Too many failed attempts. Please wait a moment and try again.';
          break;
        case 'auth/invalid-email':
          $scope.loginError = 'Please enter a valid email address.';
          break;
        default:
          $scope.loginError = 'Login failed. Please check your connection and try again.';
      }

      $scope.$apply();
    });
  };
});
