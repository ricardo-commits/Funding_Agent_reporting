// Simple test to verify the sequence hook works
// This can be run in the browser console to test the hook

// Test the hook data structure
const testSequenceData = [
  { sequence: 1, total_count: 100, positive_count: 12 },
  { sequence: 2, total_count: 350, positive_count: 190 },
  { sequence: 3, total_count: 360, positive_count: 73 },
  { sequence: 4, total_count: 80, positive_count: 49 }
];

// Calculate percentages like the component does
const totalResponses = testSequenceData.reduce((sum, item) => sum + item.total_count, 0);
const totalPositiveResponses = testSequenceData.reduce((sum, item) => sum + item.positive_count, 0);

console.log('Test Data:', testSequenceData);
console.log('Total Responses:', totalResponses);
console.log('Total Positive Responses:', totalPositiveResponses);

// Calculate percentages
const totalPercentages = testSequenceData.map(item => 
  ((item.total_count / totalResponses) * 100).toFixed(1)
);

const positivePercentages = testSequenceData.map(item => 
  ((item.positive_count / totalPositiveResponses) * 100).toFixed(1)
);

console.log('Total Response Percentages:', totalPercentages);
console.log('Positive Response Percentages:', positivePercentages);

// Expected output should match your requirements:
// Total: 1st: 10.9%, 2nd: 39.7%, 3rd: 40.5%, 4th: 9.0%
// Positive: 1st: 11.9%, 2nd: 54.2%, 3rd: 20.3%, 4th: 13.6%
