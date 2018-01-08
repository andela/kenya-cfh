describe('HeaderController', function() {
  beforeEach(module('mean.system'));

  var $controller, $rootScope;

  beforeEach(inject(function(_$controller_, _$rootScope_){
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));

  describe('$scope.menu', function() {
    describe('scope.menu should be defined', function() {
      it('return for menu defined', function() {
        var $scope = $rootScope.$new();
        var controller = $controller('HeaderController', { $scope: $scope });
        expect($scope.menu).toBeDefined(2);
      });
    });
    describe('number of objects in the menu array', function() {
      it('returns true for number of objects in the menu array', function() {
        var $scope = $rootScope.$new();
        var controller = $controller('HeaderController', { $scope: $scope });
        expect($scope.menu.length).toEqual(2);
      });
    });
    describe('check for objects in scope.menu', function() {
      it('returns true for objects in the menu array', function() {
        var $scope = $rootScope.$new();
        var controller = $controller('HeaderController', { $scope: $scope });
        expect($scope.menu).toContain({"title": "Articles",
        "link": "articles"});
      });
    });
    describe('confirm that $scope.menu is an array', function() {
      it('returns true for type og $scope.menu', function() {
        var $scope = $rootScope.$new();
        var controller = $controller('HeaderController', { $scope: $scope });
        expect(Array.isArray($scope.menu)).toBeTruthy();
      });
    });    
  });
});