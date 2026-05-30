// ============================================================
// WINX DIGITAL SOLUTIONS — Public Website Angular App
// ============================================================

// Initialize EmailJS
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY"); // ← replace with your EmailJS public key

var app = angular.module('winxApp', []);

app.controller('MainController', function ($scope, $window) {

  // ===== NAVBAR SCROLL EFFECT =====
  angular.element($window).on('scroll', function () {
    var nav = document.getElementById('mainNav');
    if ($window.pageYOffset > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ===== PACKAGES DATA =====
  $scope.packages = [
    {
      name: "Starter Package",
      price: "₱5,000 – ₱12,000",
      icon: "bi-layout-text-window",
      desc: "Basic company or portfolio website — clean, mobile-ready, and professional.",
      featured: false,
      features: ["Up to 5 pages", "Mobile responsive", "Contact form", "Basic SEO setup", "Delivery: 1–2 weeks"]
    },
    {
      name: "Professional Package",
      price: "₱15,000 – ₱35,000",
      icon: "bi-laptop",
      desc: "Multi-page website with custom design, CMS integration, and SEO basics.",
      featured: true,
      features: ["Multi-page custom design", "CMS integration", "Social media links", "SEO basics included", "Delivery: 2–4 weeks"]
    },
    {
      name: "Enterprise Package",
      price: "₱40,000 – ₱100,000+",
      icon: "bi-server",
      desc: "Full web application or management system with database and admin panel.",
      featured: false,
      features: ["Custom web application", "Database integration", "User roles & admin panel", "API integrations", "Delivery: 4–8 weeks"]
    },
    {
      name: "Maintenance Package",
      price: "₱1,500 – ₱5,000/mo",
      icon: "bi-shield-check",
      desc: "Monthly care for your website — updates, monitoring, and support.",
      featured: false,
      features: ["Monthly updates", "Uptime monitoring", "Technical support", "Performance reports", "Priority response"]
    }
  ];

  // ===== TEAM DATA — replace links and photos with real info =====
  $scope.team = [
    {
      name: "Andrei D. Landicho",
      role: "Project Lead",
      bio: "Oversees project delivery and client communication. Specializes in full-stack development.",
      photo: "assets/images/team/andrei.jpg",
      facebook: "https://facebook.com/",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      cv: "#"
    },
    {
      name: "Aifah Mae P. Maddie",
      role: "Technical Lead",
      bio: "Leads backend architecture and infrastructure. Expert in cloud deployment and APIs.",
      photo: "assets/images/team/aifah.jpg",
      facebook: "https://facebook.com/",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      cv: "#"
    },
    {
      name: "Katrina Mae M. Daludado",
      role: "Design Lead",
      bio: "Creates intuitive UI/UX experiences. Manages brand consistency and Figma design systems.",
      photo: "assets/images/team/katrina.jpg",
      facebook: "https://facebook.com/",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      cv: "#"
    },
    {
      name: "Rebecca Ruth M. Rojas",
      role: "Business/Client Lead",
      bio: "Handles client relationships, marketing, and proposals. Bridge between tech and business.",
      photo: "assets/images/team/rebecca.jpg",
      facebook: "https://facebook.com/",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      cv: "#"
    }
  ];

  // ===== FORM STATE =====
  $scope.form    = {};
  $scope.formSent = false;
  $scope.sending  = false;

  // ===== SEND CONSULTATION — writes to Firebase + sends email =====
  $scope.sendConsultation = function () {
    if (!$scope.form.businessName || !$scope.form.email ||
        !$scope.form.contactPerson || !$scope.form.background || !$scope.form.location) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    $scope.sending = true;

    var payload = {
      businessName:  $scope.form.businessName,
      location:      $scope.form.location,
      contactPerson: $scope.form.contactPerson,
      email:         $scope.form.email,
      revenue:       $scope.form.revenue  || '',
      package:       $scope.form.package  || '',
      background:    $scope.form.background,
      notes:         $scope.form.notes    || '',
      status:        'new',
      createdAt:     firebase.firestore.FieldValue.serverTimestamp()
    };

    // 1. Write to Firestore
    db.collection('consultations').add(payload)
      .then(function () {
        // 2. Also send email via EmailJS (optional but nice)
        return emailjs.send(
          "YOUR_SERVICE_ID",    // ← replace
          "YOUR_TEMPLATE_ID",   // ← replace
          {
            business_name:  payload.businessName,
            location:       payload.location,
            contact_person: payload.contactPerson,
            email:          payload.email,
            revenue:        payload.revenue  || 'Not specified',
            package:        payload.package  || 'Not decided yet',
            background:     payload.background,
            notes:          payload.notes    || 'None'
          }
        );
      })
      .then(function () {
        $scope.sending  = false;
        $scope.formSent = true;
        $scope.$apply();
      })
      .catch(function (err) {
        // If Firestore succeeded but email failed, still show success
        // (the data is already in the DB — the admin will see it)
        $scope.sending  = false;
        $scope.formSent = true;
        $scope.$apply();
        console.warn('EmailJS warning (form still saved to DB):', err);
      });
  };

  $scope.resetForm = function () {
    $scope.form    = {};
    $scope.formSent = false;
  };
});
