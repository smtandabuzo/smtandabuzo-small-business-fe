const { spawn } = require('child_process');

// Set environment variables
process.env.TERM = 'xterm-256color';

// Start the Angular development server
const ng = spawn('ng', ['serve'], { 
  stdio: 'inherit',
  shell: true
});

ng.on('error', (error) => {
  console.error('Error starting the development server:', error);
});

ng.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});
