const Log = require('log');

import crypto from 'crypto';
import { db } from '../db';
import toSmallCamel from '../utils/toSmallCamel';
import moment from 'moment';

const logger = new Log('AdminService');

/**
 * 获取博客配置信息
 */
export async function getConfig() {
  const meta = await db('Blog_Config').first();
  return toSmallCamel(meta, '_');
}

/**
 * 获取博客配置信息(博客前端专用)
 */
export async function getConfigForBlog() {
  const config = await getConfig();
  const articleMeta = await db('Article')
    .select('id', 'route', { shortName: 'short_name' })
    .orderBy('create_at', 'desc');
  config.articles = articleMeta;
  return config;
}

/**
 *
 * @param {{ pageTitle, blogName, slogen, topIconUrl, weiboLink, githubLink, mailLink, pageSize, footer, footerLink, bgUrl, bgColor }} config 博客配置对象
 */
export async function updateConfig(config) {
  const {
    pageTitle,
    blogName,
    slogen,
    topIconUrl,
    weiboLink,
    githubLink,
    mailLink,
    pageSize,
    footer,
    footerLink,
    bgUrl,
    bgColor
  } = config;
  await db('Blog_Config')
    .where('id', 1)
    .update({
      'page_title': pageTitle,
      'blog_name': blogName,
      'slogen': slogen,
      'top_icon_url': topIconUrl,
      'weibo_link': weiboLink,
      'github_link': githubLink,
      'mail_link': mailLink,
      'page_size': pageSize,
      'footer': footer,
      'footer_link': footerLink,
      'bg_url': bgUrl,
      'bg_color': bgColor
    });
}

/**
 * 获取管理页dashboard座右铭
 */
export function getMotto() {
  const index = Math.floor(Math.random() * mottos.length);
  return mottos[index];
}

/**
 * 获取浏览记录
 */
export async function getViewCount() {
  const meta = await db('View_History')
    .count('id as count')
    .first();
  return meta.count;
}

/**
 * 获取进入浏览记录
 */
export async function getTodayViewCount() {
  const meta = await db('View_History')
    .count('id as count')
    .where(
      'create_at',
      '>',
      moment()
        .startOf('day')
        .toDate()
        .getTime()
    )
    .first();
  return meta.count;
}

/**
 * 获取浏览文章排名
 */
export async function getViewRank() {
  const rows = await db.raw(`
  select p.title as title, p.id as id, count(v.post_id) as count from View_History v 
    left join Post as p on p.id = v.post_id 
    group by v.post_id
    order by count desc limit 5`);

  return rows;
}

export async function checkLogin(username, password) {
  const adminInfo = await db('User').where('user_name', username).first();
  if (adminInfo) {
    if (adminInfo.password !== password) {
      return '密码错误';
    } else {
      return '';
    }
  } else {
    return '用户名不正确';
  }
}
export async function queryUserByToken(token) {
  return await db('User').select({ username: 'user_name' })
  .where('token', token).first();
}

export async function updateToken(userName, token) {
  await db('User').where('user_name', userName).update({ token });
}

export async function clearToken(userName) {
  await db('User').where('user_name', userName).update({ token: '' });
}

export function genToken(username) {
  const md5 = crypto.createHash('md5');
  return md5.update(`${username}/${new Date().getTime}`).digest('base64');
}

export async function updateUsername(oldUsername, newUsername, password) {
  const adminInfo = await db('User')
  .where({ 'user_name': oldUsername, 'password': password }).first();
  if (adminInfo) {
    await db('User')
    .update({ 'user_name': newUsername }).where('user_name', oldUsername);
    return '';
  } else {
    return '用户信息校验失败';
  }
}

export async function updatePassword(username, oldPassword, newPassword) {
  const adminInfo = await db('User')
  .where({ 'user_name': username, 'password': oldPassword }).first();
  if (adminInfo) {
    await db('User')
    .update({ 'password': newPassword }).where('user_name', username);
    return '';
  } else {
    return '用户信息校验失败';
  }
}

const mottos = [
  '强者的眼中，没有最好，只有更好。',
  '盆景秀木正因为被人溺爱，才破灭了成为栋梁之材的梦。',
  '永远都不要放弃自己，勇往直前，直至成功！',
  '没有平日的失败，就没有最终的成功。重要的是分析失败原因并吸取教训。',
  '蝴蝶如要在百花园里得到飞舞的欢乐，那首先得忍受与蛹决裂的痛苦。',
  '萤火虫的光点虽然微弱，但亮着便是向黑暗挑战。',
  '面对人生旅途中的挫折与磨难，我们不仅要有勇气，更要有坚强的信念。',
  '对坚强的人来说，不幸就像铁犁一样开垦着他内心的大地，虽然痛，却可以播种。',
  '想而奋进的过程，其意义远大于未知的结果。',
  '上有天，下有地，中间站着你自己，做一天人，尽一天人事儿。',
  '努力向上的开拓，才使弯曲的竹鞭化作了笔直的毛竹。',
  '只要你确信自己正确就去做。做了有人说不好，不做还是有人说不好，不要逃避批判。',
  '对没志气的人，路程显得远；对没有银钱的人，城镇显得远。',
  '生命力的意义在于拼搏，因为世界本身就是一个竞技场。',
  '通过云端的道路，只亲吻攀登者的足迹。',
  '不经巨大的困难，不会有伟大的事业。',
  '泉水，奋斗之路越曲折，心灵越纯洁。',
  '人的一生，可以有所作为的时机只有一次，那就是现在。',
  '对于攀登者来说，失掉往昔的足迹并不可惜，迷失了继续前时的方向却很危险。',
  '生命的道路上永远没有捷径可言，只有脚踏实地走下去。',
  '时间顺流而下，生活逆水行舟。',
  '一个人，只要知道付出爱与关心，她内心自然会被爱与关心充满。',
  '你要求的次数愈多，你就越容易得到你要的东西，而且连带地也会得到更多乐趣。',
  '有大快乐的人，必有大哀痛；有大成功的人，必有大孤独。',
  '成功等于目标，其他都是这句话的注解。',
  '生命之长短殊不重要，只要你活得快乐，在有生之年做些有意义的事，便已足够。',
  '路在自己脚下，没有人可以决定我的方向。',
  '命运是不存在的，它不过是失败者拿来逃避现实的借口。',
  '生命太过短暂，今天放弃了明天不一定能得到。',
  '改变自我，挑战自我，从现在开始。',
  '沉湎于希望的人和守株待兔的樵夫没有什么两样。',
  '知识给人重量，成就给人光彩，大多数人只是看到了光彩，而不去称量重量。',
  '吃别人吃不了的苦，忍别人受不了的气，付出比别人更多的，才会享受的比别人更多。',
  '不会生气的人是愚者，不生气的人乃真正的智者。',
  '每一发奋努力的背后，必有加倍的赏赐。',
  '能克服困难的人，可使困难化为良机。',
  '如果你受苦了，感谢生活，那是它给你的一份感觉;如果你受苦了，感谢上帝，说明你还活着。人们的灾祸往往成为他们的学问。',
  '沉湎于希望的人和守株待兔的樵夫没有什么两样。',
  '不要让追求之舟停泊在幻想的港湾，而应扬起奋斗的风帆，驶向现实生活的大海。',
  '每个人的一生都有许多梦想，但如果其中一个不断搅扰着你，剩下的就仅仅是行动了。',
  '只有不想做的，没有做不到的。',
  '志在峰巅的攀登者，不会陶醉在沿途的某个脚印之中。',
  '你既然认准一条道路，何必去打听要走多久。',
  '通过云端的道路，只亲吻攀登者的足迹。',
  '美丽的蓝图，落在懒汉手里，也不过是一页废纸。',
  '一时的挫折往往可以通过不屈的搏击，变成学问及见识。',
  '再黑的黑夜也会迎来黎明，再长的坎坷也会出现平路，怀抱着一棵永不放弃的希望之心，明天就会有温暖的阳光雨露，坚持吧朋友，胜利就在你的下一步路！',
  '要用行动控制情绪，不要让情绪控制行动；要让心灵启迪智慧，不能让耳朵支配心灵。人与人之间的差别，主要差在两耳之间的那块地方！',
  '不是井里没有水，而是挖的不够深；不是成功来的慢，而是放弃速度快。得到一件东西需要智慧，放弃一样东西则需要勇气！',
  '没有什么事情有象热忱这般具有传染性，它能感动顽石，它是真诚的精髓。',
  '很多爱不能重来我应该释怀输不起就不要输。',
  '没有创造的生活不能算生活，只能算活着。',
  '只要还有明天，今天就永远是起跑线。',
  '如果命运不宠你，请你别伤害自己。',
  '趁年轻去努力，别对不起你儿时吹的牛逼。',
  '你一个人心情不好，不代表全世界都需要陪你难过。',
  '没有人能一路单纯到底，但要记住，别忘了最初的自己。',
  '如果要给美好人生一个定义，那就是惬意。如果要给惬意一个定义，那就是三五知己、谈笑风生。',
  '生中有些事是不得不做的，于不得不做中勉强去做，是毁灭，于不得不做中做的好，是勇敢。',
  '胜利属于坚持到最后的人。',
  '实力的来源不是胜利。唯有奋斗才能增强实力。当你历经苦难而不气馁，那就是实力。',
  '经过大海的一番磨砺，卵石才变得更加美丽光滑。',
  '河流之所以能够到达目的地，是因为它懂得怎样避开障碍。',
  '不可压倒一切，但你也不能被一切压倒。',
  '一个人的成败，与他的心量有很大关系。',
  '你失去了金钱，可以再挣；你失去了一生，便再也不能回头。',
  '目标的坚定是性格中最必要的力量源泉之一，也是成功的利器之一。没有它，天才会在矛盾无定的迷径中徒劳无功。',
  '生命的多少用时间计算，生命的价值用贡献计算。',
  '点燃了的火炬不是为了火炬本身，就像我们的美德应该超过自己照亮别人。',
  '贝壳虽然死了，却把它的美丽留给了整个世界。',
  '路靠自己走，就算再坎坷，也要自己过。',
  '失败并不意味你浪费了时间和生命，失败表明你有理由重新开始。',
  '生活不是用来妥协的，你退缩得越多，能让你喘息的空间就越有限。日子不是用来将就的，你表现得越卑微，一些幸福的东西就会离你越远。',
  '只有承担起旅途风雨，才能最终守得住彩虹满天。',
  '忍受和奋斗就可以征服的命运。',
  '梦想是注定孤独的旅行，路上少不了质疑和嘲笑，但那又怎样，哪怕遍体鳞伤也要活的漂亮。',
  '不管现在有多么艰辛，我们也要做个生活的舞者。',
  '命运从来不会同情弱者。',
  '不怕万人阻挡在前方，只怕自己先行投降。',
  '生活其实很简单，过了今天就是明天。',
  '路的尽头，仍然是路，只要你愿意走。',
  '当你手中抓住一件东西不放时，你只能拥有一件东西，如果你肯放手，你就有机会选择更多。',
  '现在不努力，将来拿什么向曾经抛弃你的人证明它有多瞎。',
  '尽力做好一件事，实乃人生之首务。',
  '应该让别人的生活因为有了你的生存而更加美好。',
  '快乐是一种香水，无法倒在别人身上，而自己却不沾上一些。',
  '你配不上自己的野心，也辜负了曾经历的苦难。',
  '人生没有如果，只有后果和结果。少问别人为什么，多问自己凭什么。',
  '现在不玩命，将来命玩你，现在不努力，未来不给力。',
  '现在不努力，将来拿什么向曾经抛弃你的人证明它有多瞎。',
  '无论你昨晚经历了怎样的泣不成声，早上醒来这个城市依旧车水马龙。',
  '比我差的人还没放弃，比我好的人仍在努力，我就更没资格说我无能为力！',
  '没有人能替你承受痛苦，也没有人能抢走你的坚强。',
  '不要拿我跟任何人比，我不是谁的影子，更不是谁的替代品，我不知道年少轻狂，我只懂得胜者为。',
  '如果你看到面前的阴影，别怕，那是因为你的背后有阳光。',
  '累么？累就对了，舒服是留给死人的。',
  '如果你坚信石头会开花，那么开花的不仅仅是石头。',
  '过所爱的生活，爱所过的生活，快乐的生活，才能生活快乐，快乐的工作，才有快乐人生，生活的理想其实就是理想的生活！',
  '无论你觉得自己多么的不幸，永远有人比你更加不幸。',
  '自己丰富才感知世界丰富，自己善良才感知社会美好，自己坦荡才感受生活喜悦，自己成功才感悟生命壮观！'
];
