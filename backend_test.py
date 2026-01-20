import requests
import sys
import json
from datetime import datetime

class TransportProAPITester:
    def __init__(self, base_url="https://transportpro-4.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_stats_endpoint(self):
        """Test stats endpoint"""
        return self.run_test("Stats API", "GET", "stats", 200)

    def test_packages_endpoint(self):
        """Test packages endpoint"""
        return self.run_test("Packages API", "GET", "packages", 200)

    def test_register_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Test Driver {timestamp}",
            "email": f"test_driver_{timestamp}@example.com",
            "password": "TestPass123!",
            "phone": "+380501234567",
            "city": "Київ",
            "user_type": "driver"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_user)
        if success:
            self.user_id = response.get('id')
            # Store credentials for login test
            self.test_email = test_user['email']
            self.test_password = test_user['password']
        return success, response

    def test_login_user(self):
        """Test user login"""
        if not hasattr(self, 'test_email'):
            self.log_test("User Login", False, "No registered user to login with")
            return False, {}
        
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
        return success, response

    def test_get_me(self):
        """Test get current user"""
        if not self.token:
            self.log_test("Get Current User", False, "No token available")
            return False, {}
        
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_demo_activation(self):
        """Test demo subscription activation"""
        if not self.token:
            self.log_test("Demo Activation", False, "No token available")
            return False, {}
        
        return self.run_test("Demo Subscription Activation", "POST", "demo/activate-subscription", 200)

    def test_add_vehicle(self):
        """Test adding a vehicle"""
        if not self.token:
            self.log_test("Add Vehicle", False, "No token available")
            return False, {}
        
        vehicle_data = {
            "vehicle_type": "cargo",
            "brand": "Mercedes",
            "model": "Actros",
            "year": 2020,
            "capacity_tons": 20.0,
            "dimensions_length": 13.6,
            "dimensions_width": 2.5,
            "dimensions_height": 3.0,
            "description": "Надійна вантажівка для перевезень",
            "price_per_km": 15.50,
            "available": True,
            "images": []
        }
        
        success, response = self.run_test("Add Vehicle", "POST", "vehicles", 201, vehicle_data)
        if success:
            self.vehicle_id = response.get('id')
        return success, response

    def test_get_vehicles(self):
        """Test getting vehicles list"""
        return self.run_test("Get Vehicles", "GET", "vehicles", 200)

    def test_get_my_vehicles(self):
        """Test getting user's vehicles"""
        if not self.token:
            self.log_test("Get My Vehicles", False, "No token available")
            return False, {}
        
        return self.run_test("Get My Vehicles", "GET", "vehicles/my", 200)

    def test_search_cargo_vehicles(self):
        """Test searching cargo vehicles"""
        return self.run_test("Search Cargo Vehicles", "GET", "vehicles?vehicle_type=cargo", 200)

    def test_search_passenger_vehicles(self):
        """Test searching passenger vehicles"""
        return self.run_test("Search Passenger Vehicles", "GET", "vehicles?vehicle_type=passenger", 200)

    def test_search_vehicles_by_city(self):
        """Test searching vehicles by city"""
        return self.run_test("Search Vehicles by City", "GET", "vehicles?city=Київ", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting TransportPro API Tests")
        print("=" * 50)
        
        # Basic endpoints
        self.test_root_endpoint()
        self.test_stats_endpoint()
        self.test_packages_endpoint()
        
        # Authentication flow
        self.test_register_user()
        self.test_login_user()
        self.test_get_me()
        
        # Demo subscription
        self.test_demo_activation()
        
        # Vehicle management
        self.test_add_vehicle()
        self.test_get_vehicles()
        self.test_get_my_vehicles()
        
        # Search functionality
        self.test_search_cargo_vehicles()
        self.test_search_passenger_vehicles()
        self.test_search_vehicles_by_city()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check details above.")
            return 1

def main():
    tester = TransportProAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())