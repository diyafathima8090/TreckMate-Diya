import('./server.js').then(() => {
  console.log('Server imported successfully');
  process.exit(0);
}).catch(err => {
  console.error('Error importing server.js:');
  console.error(err);
  process.exit(1);
});
