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

export async function isSenderOwner(group_id, sender_id) {
  return await getSenderRole(group_id, sender_id) === 'owner';
}

export async function isSenderAdmin(group_id, sender_id) {
  return await getSenderRole(group_id, sender_id) === 'attend';
}

export async function isSenderOwnerOrAdmin(group_id, sender_id) {
  const role = await getSenderRole(group_id, sender_id);
  return role === 'attend' || role === 'owner';
}

async function getSenderRole(group_id, sender_id) {
  try {
    // await axios.get('http://localhost:5000/openqq/get_group_info');
    const meta = await axios.get('http://localhost:5000/openqq/search_group', {
      params: { id: group_id }
    });
    let groupInfo = meta.data;
    if (!groupInfo.length) return null;
    groupInfo = groupInfo[0];
    const sender = groupInfo.member
    .find(member => {
      return member.id === sender_id;
    });
    if (!sender) return null;
    return sender.role;
  } catch (e) {
    console.log(e);
    return null;
  }
}