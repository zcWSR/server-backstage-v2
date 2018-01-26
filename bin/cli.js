#!/usr/bin/env node

const blessed = require('blessed');

let screen = blessed.screen({
  smartCSR: true
  });

screen.title = 'mySite CLI';

let box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Hello {bold}world{/bold}!',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'magenta',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
});

screen.append(box);

box.on('click', data => {
  box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  screen.render();
})

screen.key(['escape', 'C-c'], function(ch, key) {
  return process.exit(0);
});

box.focus();

screen.render();