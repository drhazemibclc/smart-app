// Pre-request Script for Medical Records Tests
const testSuite = {
  name: 'Medical Records Test Suite',
  timestamp: Date.now(),

  // Generate test data
  generateTestData() {
    return {
      patient: {
        firstName: `TestPatient${this.timestamp}`,
        lastName: 'Test',
        dateOfBirth: '2020-01-15',
        gender: 'MALE',
        parentName: 'Test Parent',
        parentPhone: '+1234567890',
        parentEmail: `test${this.timestamp}@example.com`
      },
      medicalRecord: {
        diagnosis: 'Acute bronchitis',
        symptoms: ['Cough', 'Fever', 'Fatigue', 'Loss of appetite'],
        treatment: 'Prescribed amoxicillin 250mg/5ml, 5ml three times daily for 7 days',
        notes: 'Patient presented with persistent cough and fever for 3 days. Lungs clear on auscultation.',
        vitalSigns: {
          temperature: 38.5,
          heartRate: 110,
          respiratoryRate: 22,
          bloodPressureSystolic: 110,
          bloodPressureDiastolic: 70,
          oxygenSaturation: 98,
          weight: 18.5,
          height: 110
        }
      }
    };
  }
};

// Set test data
const testData = testSuite.generateTestData();
pm.variables.set('testPatient', JSON.stringify(testData.patient));
pm.variables.set('testMedicalRecord', JSON.stringify(testData.medicalRecord));
pm.variables.set('timestamp', testSuite.timestamp);
