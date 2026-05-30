// ============================================================
// WINX DIGITAL SOLUTIONS — Admin Dashboard Controller
// ============================================================

var dashApp = angular.module('winxDashApp', []);

// Custom filter: replace characters in a string
dashApp.filter('replace', function () {
  return function (input, from, to) {
    if (!input) return '';
    return input.split(from).join(to);
  };
});

dashApp.controller('DashboardController', function ($scope, $window, $filter) {

  // ===== AUTH GUARD =====
  $scope.checkingAuth = true;

  auth.onAuthStateChanged(function (user) {
    if (!user) {
      $window.location.href = 'login.html';
      return;
    }
    $scope.checkingAuth = false;
    $scope.adminEmail   = user.email;
    $scope.adminInitial = user.email.charAt(0).toUpperCase();
    $scope.$apply();

    // Load data after auth confirmed
    loadConsultations();
    loadProjects();
  });

  // ===== LOGOUT =====
  $scope.logout = function () {
    auth.signOut().then(function () {
      $window.location.href = 'login.html';
    });
  };

  // ===== UI STATE =====
  $scope.activeTab        = 'consultations';
  $scope.sidebarCollapsed = false;
  $scope.today            = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  $scope.consultSearch    = '';
  $scope.statusFilter     = '';
  $scope.loading          = true;
  $scope.loadingProjects  = true;
  $scope.consultations    = [];
  $scope.projects         = [];
  $scope.selectedConsult  = null;
  $scope.editingProject   = false;
  $scope.savingProject    = false;
  $scope.projectForm      = {};

  $scope.setTab = function (tab) {
    $scope.activeTab = tab;
  };

  // ===== COMPUTED COUNTS =====
  Object.defineProperty($scope, 'newCount', {
    get: function () {
      return $scope.consultations.filter(function (c) { return (c.status || 'new') === 'new'; }).length;
    }
  });
  Object.defineProperty($scope, 'scheduledCount', {
    get: function () {
      return $scope.consultations.filter(function (c) { return c.status === 'scheduled'; }).length;
    }
  });
  Object.defineProperty($scope, 'closedCount', {
    get: function () {
      return $scope.consultations.filter(function (c) { return c.status === 'closed'; }).length;
    }
  });

  // ===== FILTER CONSULTATIONS =====
  $scope.filteredConsultations = function () {
    var q = ($scope.consultSearch || '').toLowerCase();
    return $scope.consultations.filter(function (c) {
      var matchSearch = !q ||
        (c.businessName  || '').toLowerCase().includes(q) ||
        (c.email         || '').toLowerCase().includes(q) ||
        (c.location      || '').toLowerCase().includes(q) ||
        (c.contactPerson || '').toLowerCase().includes(q);
      var matchStatus = !$scope.statusFilter || (c.status || 'new') === $scope.statusFilter;
      return matchSearch && matchStatus;
    });
  };

  // ===== LOAD CONSULTATIONS (real-time listener) =====
  function loadConsultations() {
    db.collection('consultations')
      .orderBy('createdAt', 'desc')
      .onSnapshot(function (snapshot) {
        $scope.consultations = snapshot.docs.map(function (doc) {
          var data = doc.data();
          return angular.extend({}, data, {
            id:        doc.id,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
          });
        });
        $scope.loading = false;
        $scope.$apply();
      }, function (err) {
        console.error('Firestore consultations error:', err);
        $scope.loading = false;
        $scope.$apply();
      });
  }

  // ===== VIEW CONSULTATION DETAIL =====
  $scope.viewConsultation = function (c) {
    $scope.selectedConsult = c;
    var modal = new bootstrap.Modal(document.getElementById('consultModal'));
    modal.show();
  };

  // ===== UPDATE STATUS =====
  $scope.updateStatus = function (c, newStatus) {
    db.collection('consultations').doc(c.id).update({ status: newStatus })
      .catch(function (err) { console.error('Status update failed:', err); });
  };

  // ===== DELETE CONSULTATION =====
  $scope.deleteConsultation = function (c) {
    if (!confirm('Delete this consultation from ' + c.businessName + '? This cannot be undone.')) return;
    db.collection('consultations').doc(c.id).delete()
      .catch(function (err) { console.error('Delete failed:', err); });
  };

  // ===== ADD TO GOOGLE CALENDAR =====
  // Opens Google Calendar event creation with pre-filled details
  $scope.addToCalendar = function (c) {
    var title    = encodeURIComponent('Consultation: ' + c.businessName);
    var details  = encodeURIComponent(
      'Contact: ' + c.contactPerson + '\n' +
      'Email: ' + c.email + '\n' +
      'Package: ' + (c.package || 'TBD') + '\n\n' +
      'Background: ' + c.background
    );
    var location = encodeURIComponent(c.location);

    // Default: tomorrow, 10am–11am Manila time
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var ymd = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');
    var start = ymd + 'T020000Z'; // 10am PHT = 02:00 UTC
    var end   = ymd + 'T030000Z'; // 11am PHT = 03:00 UTC

    var url = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + title +
      '&details=' + details +
      '&location=' + location +
      '&dates=' + start + '/' + end;

    $window.open(url, '_blank');
  };

  // ===== BOOK GOOGLE MEET =====
  // Opens Google Meet new meeting link
  $scope.bookMeet = function (c) {
    // Opens Google Calendar event creation with Meet auto-attached
    var title   = encodeURIComponent('Winx Consultation: ' + c.businessName);
    var details = encodeURIComponent(
      'Free consultation with ' + c.contactPerson + ' from ' + c.businessName + '.\n\n' +
      'Email: ' + c.email + '\n' +
      'Package interest: ' + (c.package || 'TBD')
    );

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var ymd   = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');
    var start = ymd + 'T020000Z';
    var end   = ymd + 'T030000Z';

    var url = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + title +
      '&details=' + details +
      '&dates=' + start + '/' + end +
      '&add=meet'; // signals Google to add a Meet link

    $window.open(url, '_blank');
  };

  // ===== LOAD PROJECTS (real-time listener) =====
  function loadProjects() {
    db.collection('projects')
      .orderBy('createdAt', 'desc')
      .onSnapshot(function (snapshot) {
        $scope.projects = snapshot.docs.map(function (doc) {
          var data = doc.data();
          return angular.extend({}, data, {
            id:        doc.id,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            startDate: data.startDate ? new Date(data.startDate) : null
          });
        });
        $scope.loadingProjects = false;
        $scope.$apply();
      }, function (err) {
        console.error('Firestore projects error:', err);
        $scope.loadingProjects = false;
        $scope.$apply();
      });
  }

  // ===== PROJECT STATS =====
  $scope.completedProjects = function () {
    return $scope.projects.filter(function (p) { return p.phase === 'Completed' || p.percentage === 100; }).length;
  };
  $scope.activeProjects = function () {
    return $scope.projects.filter(function (p) { return p.phase !== 'Completed' && p.percentage < 100; }).length;
  };
  $scope.totalBudget = function () {
    return $scope.projects.reduce(function (sum, p) { return sum + (parseFloat(p.budget) || 0); }, 0);
  };

  // ===== PROGRESS BAR COLOR =====
  $scope.progressColor = function (pct) {
    if (pct >= 100) return 'bg-success';
    if (pct >= 60)  return 'bg-primary';
    if (pct >= 30)  return 'bg-warning';
    return 'bg-danger';
  };

  // ===== OPEN PROJECT MODAL =====
  $scope.openProjectModal = function () {
    $scope.editingProject = false;
    $scope.projectForm    = { percentage: 0 };
    var modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
  };

  // ===== EDIT PROJECT =====
  $scope.editProject = function (p) {
    $scope.editingProject = true;
    $scope.editingProjectId = p.id;
    $scope.projectForm = {
      name:        p.name,
      client:      p.client      || '',
      budget:      p.budget,
      phase:       p.phase,
      percentage:  p.percentage  || 0,
      description: p.description || '',
      startDate:   p.startDate ? p.startDate.toISOString().split('T')[0] : ''
    };
    var modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
  };

  // ===== SAVE PROJECT (add or update) =====
  $scope.saveProject = function () {
    if (!$scope.projectForm.name || !$scope.projectForm.budget || !$scope.projectForm.phase) {
      alert('Please fill in Project Name, Budget, and Phase.');
      return;
    }

    $scope.savingProject = true;

    var payload = {
      name:        $scope.projectForm.name,
      client:      $scope.projectForm.client      || '',
      budget:      parseFloat($scope.projectForm.budget),
      phase:       $scope.projectForm.phase,
      percentage:  parseInt($scope.projectForm.percentage) || 0,
      description: $scope.projectForm.description || '',
      startDate:   $scope.projectForm.startDate   || ''
    };

    var promise;
    if ($scope.editingProject) {
      promise = db.collection('projects').doc($scope.editingProjectId).update(payload);
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      promise = db.collection('projects').add(payload);
    }

    promise
      .then(function () {
        $scope.savingProject = false;
        $scope.$apply();
        bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
      })
      .catch(function (err) {
        $scope.savingProject = false;
        $scope.$apply();
        alert('Failed to save project. Please try again.');
        console.error('Project save error:', err);
      });
  };

  // ===== DELETE PROJECT =====
  $scope.deleteProject = function (p) {
    if (!confirm('Delete project "' + p.name + '"? This cannot be undone.')) return;
    db.collection('projects').doc(p.id).delete()
      .catch(function (err) { console.error('Project delete failed:', err); });
  };
});
