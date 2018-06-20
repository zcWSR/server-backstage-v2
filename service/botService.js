import axios from 'axios';

export function sayAgain(id, content, timeout = 3000) {
  setTimeout(() => {
    sendGroup(id, content);
  }, timeout);
}
export function sendGroup(group_id, message) {
  axios.post('http://localhost:5000/send_group_message', {
    data: { group_id, message }
  });
}

export async function isSenderOwner(group_id, user_id) {
  return await getSenderRole(group_id, user_id) === 'owner';
}

export async function isSenderAdmin(group_id, user_id) {
  return await getSenderRole(group_id, user_id) === 'admin';
}

export async function isSenderOwnerOrAdmin(group_id, user_id) {
  const role = await getSenderRole(group_id, user_id);
  return role === 'admin' || role === 'owner';
}

export async function getSenderRole(group_id, user_id) {
  try {
    // await axios.get('http://localhost:5000/openqq/get_group_info');
    const meta = await axios.post('http://localhost:5000/get_group_member_info', {
      data: { group_id, user_id }
    });
    let memberInfo = meta.data;
    if (!memberInfo.user_id) return null;
    return memberInfo.role;
  } catch (e) {
    console.log(e);
    return null;
  }
}