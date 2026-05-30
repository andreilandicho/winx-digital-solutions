// Initialize EmailJS with your Public Key
emailjs.init("nbkCTA1NYFJJHtwOO"); // <-- replace this

var app = angular.module('winxApp', []);

app.controller('MainController', function($scope, $window) {

  // ===== NAVBAR SCROLL EFFECT =====
  angular.element($window).on('scroll', function() {
    var nav = document.getElementById('mainNav');
    if ($window.pageYOffset > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    $scope.$apply();
  });

  // ===== SMOOTH SCROLL FOR NAV LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== SERVICE PACKAGES DATA =====
  $scope.packages = [
    {
      name: "Starter Package",
      price: "₱5,000 – ₱12,000",
      icon: "bi-layout-text-window",
      desc: "Basic company or portfolio website — clean, mobile-ready, and professional.",
      featured: false,
      features: [
        "Up to 5 pages",
        "Mobile responsive",
        "Contact form",
        "Basic SEO setup",
        "Delivery: 1–2 weeks"
      ]
    },
    {
      name: "Professional Package",
      price: "₱15,000 – ₱35,000",
      icon: "bi-laptop",
      desc: "Multi-page website with custom design, CMS integration, and SEO basics.",
      featured: true,
      features: [
        "Multi-page custom design",
        "CMS integration",
        "Social media links",
        "SEO basics included",
        "Delivery: 2–4 weeks"
      ]
    },
    {
      name: "Enterprise Package",
      price: "₱40,000 – ₱100,000+",
      icon: "bi-server",
      desc: "Full web application or management system with database and admin panel.",
      featured: false,
      features: [
        "Custom web application",
        "Database integration",
        "User roles & admin panel",
        "API integrations",
        "Delivery: 4–8 weeks"
      ]
    },
    {
      name: "Maintenance Package",
      price: "₱1,500 – ₱5,000/mo",
      icon: "bi-shield-check",
      desc: "Monthly care for your website — updates, monitoring, and support.",
      featured: false,
      features: [
        "Monthly updates",
        "Uptime monitoring",
        "Technical support",
        "Performance reports",
        "Priority response"
      ]
    }
  ];

  // ===== TEAM DATA — Fill in your real info =====
  $scope.team = [
    {
      name: "Andrei D. Landicho",
      role: "Project Lead",
      bio: "Oversees project delivery, client communication, and sprint planning. Specializes in full-stack development.",
      photo: "assets/images/team/andrei.jpg",
      facebook: "https://www.facebook.com/andreidelcastillolandicho/",
      github: "https://github.com/andreilandicho",
      linkedin: "https://www.linkedin.com/in/andreilandicho/",
      cv: "#"
    },
    {
      name: "Aifah Mae P. Maddie",
      role: "Technical Lead",
      bio: "Leads backend architecture, system security, and infrastructure. Expert in cloud deployment and APIs.",
      photo: "assets/images/team/aifah.png",
      facebook: "https://facebook.com/",
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/in/maeaifah/",
      cv: "#"
    },
    {
      name: "Katrina Mae M. Daludado",
      role: "Design Lead",
      bio: "Creates intuitive UI/UX experiences. Manages brand consistency, Figma design systems, and visual assets.",
      photo: "assets/images/team/katrina.jpg",
      facebook: "https://facebook.com/",
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/in/katrina-mae-daludado/",
      cv: "#"
    },
    {
      name: "Rebecca Ruth M. Rojas",
      role: "Business/Client Lead",
      bio: "Handles client relationships, marketing, proposals, and social media. Bridge between tech and business.",
      photo: "assets/images/team/becca.png",
      facebook: "https://facebook.com/",
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/in/rebecca-rojas-/",
      cv: "#"
    }
  ];

  // ===== FORM STATE =====
  $scope.form = {};
  $scope.formSent = false;
  $scope.sending = false;

  // ===== SEND EMAIL VIA EMAILJS =====
  $scope.sendEmail = function() {
    if (!$scope.form.businessName || !$scope.form.email ||
        !$scope.form.contactPerson || !$scope.form.background || !$scope.form.location) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    $scope.sending = true;

    var templateParams = {
      business_name:   $scope.form.businessName,
      location:        $scope.form.location,
      contact_person:  $scope.form.contactPerson,
      email:           $scope.form.email,
      revenue:         $scope.form.revenue || 'Not specified',
      package:         $scope.form.package || 'Not decided yet',
      background:      $scope.form.background,
      notes:           $scope.form.notes || 'None'
    };

    emailjs.send(
      "service_nz95hsk",
      "template_melxfjh",
      templateParams
    ).then(function(response) {
      $scope.sending = false;
      $scope.formSent = true;
      $scope.$apply();
    }, function(error) {
      $scope.sending = false;
      alert('Something went wrong. Please email us directly at hello@winxdigitalsolutions.com');
      $scope.$apply();
      console.error('EmailJS error:', error);
    });
  };

  $scope.resetForm = function() {
    $scope.form = {};
    $scope.formSent = false;
  };
});