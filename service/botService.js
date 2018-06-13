import axios from 'axios';

export function sayAgain(id, content, timeout = 3000) {
  setTimeout(() => {
    sendGroup(id, content);
  }, timeout);
}
export function sendGroup(id, content) {
  axios.get('http://localhost:5000/openqq/send_group_message', {
    params: { id, content }
  });
}