const program = require('commander');
const moment = require('moment');
const chalk = require('chalk')
const table = require('text-table');
const fs = require('fs');
const { prompt, Questions, Separator, ui } = require('inquirer');
const { exec } = require('child_process');

const Util = require('./util');
const FileService = require('./service/fileService');

let filePath = '';
let title = '';
let category = '';
let labels = [];
let date = moment().format('YYYY-MM-DD HH:mm:ss');
let section = '';
let rest = '';
program.version('0.6.0');

program
  .command('new <postName>').alias('n')
  .description('创建一个新的markdown文件')
  .action(name => {
    if (!name)
      title = 'newPost';
    title = name;
    filePath = `/Users/zcwsr/Documents/blog/${title}.md`;
    if (fs.existsSync(filePath)) {
      console.log(chalk.magenta('发现重复文件'));
      filePath = `/Users/zcwsr/Documents/blog/${title}_other.md`
      console.log(chalk.magenta(`修改文件路径为: ${filePath}`));
    }
    infoComfirm()
      .then(() => {
        return FileService.
          createPostFile(filePath, { title, date, category, labels })
      })
      .then(() => {
        console.log('已创建名为: ' + chalk.green(`${title}`) + ' 的文章\n位于: ' + chalk.green(`${filePath}`));
        exec(`open '${filePath}'`);
        process.exit();
      })
      .catch(error => {
        console.log(chalk.red(error));
        process.exit();
      })
  })

program
  .command('upload <filePath>').alias('u')
  .option('--update', '更新同名文章（如果不存在同名，新建）')
  .description('上传文章至数据库')
  .action((path, options) => {
    filePath = path;
    title = path.substr(path.lastIndexOf('/') + 1).split('.')[0];
    if (!existsSync(path)) {
      console.log(chalk.red('error: file not found!'));
      return;
    }
    if (options.update) {
      update();
    } else {
      FileService.getPostFileInfo(filePath)
        .then(post => {
          ({ title, date, categories, labels, section, rest } = post);
        })
        .then(confirmAll)
        .then(doUpLoad)
        .then(() => {
          mongoDB.disconnect();
          process.exit();
        })
        .catch(err => {
          console.log(chalk.bold.underline.red(err));
          mongoDB.disconnect();
          process.exit();
        });
    }
    return;
  });


program
  .command('download <postName>').alias('d')
  .description('下载文章')
  .action(name => {
    PostService
      .queryByTitle(name)
      .then(posts => {
        if (posts.length == 0) {
          console.log(chalk.magenta('文章不存在'))
          mongoDB.disconnect();
          process.exit();
        } else {
          let questions = [
            {
              type: 'list',
              name: 'postId',
              message: '选择post',
              choices: formatePostChoices(posts)
            }
          ];
          return prompt(questions);
        }
      })
      .then((answer: any) => {
        PostService
          .queryOnePostById(answer.postId.toString())
          .then(post => {
            let loader = [
              '/ 下载中',
              '| 下载中',
              '\\ 下载中',
              '- 下载中'
            ];
            let i = 4;
            let loadingUI = new ui.BottomBar({ bottomBar: loader[i % 4] });
            let interval = setInterval(() => { loadingUI.updateBottomBar(loader[i++ % 4]); }, 200);
            let path = `/Users/zcwsr/Documents/blog/download/${post.title}.md`;
            FileService.createPostFile(path, post)
              .then(() => {
                clearInterval(interval);
                loadingUI.updateBottomBar(chalk.green('下载完成!'));
                console.log(`保存在: ${path}`);
                exec(`\nmacdown '${path}'`);
                mongoDB.disconnect();
                process.exit();
              })
              .catch(error => {
                console.log(chalk.bold.underline.red(error));
                mongoDB.disconnect();
                process.exit();
              })
            return;
          })

      })
  })


program.parse(process.argv);




async function infoComfirm() {
  let cateList = await Util.fetchCategoryListWithCount();
  await selectCates(cateList);
  let labelList = await Util.fetchLabelListwithCount();
  await selectLabels(labelList);
  console.log('=====================');
  return await confirmAll();
}

function update() {
  FileService.getPostFileInfo(filePath)
    .then(post => {
      prompt([{
        type: 'confirm',
        name: 'check',
        message: `使用创建时间(Y)还是修改时间(N)修改文章信息(默认return为创建时间)?`,
        default: true
      }])
        .then(flag => flag['check'])
        .then(check => {
          date = check ? post.date : statSync(filePath).mtime;
          return check ? '' : FileService.updatePostTime(filePath, date);
        })
        .then(() => {
          PostService.update(post.title, post)
            .then(() => {
              console.log(chalk.green('更新成功'));
              mongoDB.disconnect();
              process.exit();
            })

        })
    })
    .catch(err => {
      console.log(chalk.bold.underline.red(err));
      mongoDB.disconnect();
      process.exit();
    });
}


async function selectCates(cates) {
  let questions = [
    {
      type: 'list',
      name: 'cate',
      message: '选择category',
      choices: formatChoices({
        headers: [{ name: '类别', keyName: 'name' }, { name: '文章数', keyName: 'count' }],
        data: cates,
        key: 'name'
      })
    },
    {
      type: 'input',
      name: 'newCate',
      message: '新建category吗'
    }
  ];
  let answers = await prompt(questions);
  category = answers.cate || answers.newCate;
  let flag = await prompt([{
    type: 'confirm',
    name: 'check',
    message: `确认选择category:${chalk.bold.underline.green(category)}吗(默认return为确定)?`,
    default: true
  }]);
  if (flag.check) return ;
  else selectCates(cates);
}

async function selectLabels(_labels) {
  let questions = [
    {
      type: 'checkbox',
      name: 'labels',
      message: '选择label',
      choices: formatChoices({
        headers: [{ name: '标签', keyName: 'name' }, { name: '文章数', keyName: 'count' }],
        data: _labels,
        key: 'name'
      })
    },
    {
      type: 'input',
      name: 'otherLabels',
      message: '新建label吗，用空格分割'
    }
  ];
  let answers = await prompt(questions);
  for (let label of answers.lables) {
    labels.push(label);
  }
  if (answers.otherLabels) {
    for (let label of answers.otherLabels.split(' ').filter(item => item !== '' && item !== ' ')) {
      labels.push(label);
    }
  }
  labels = de_duplication(labels);
  let flag = await prompt([{
    type: 'confirm',
    name: 'check',
    message: `确认选择labels:${chalk.bold.underline.green(labels)}吗(默认return为确定)?`,
    default: true
  }]);
  if (flag.check) return ;
  else selectLabels(_labels);
}

async function confirmAll() {
  let allChoices = [
    ['title', chalk.green(title)],
    ['category', chalk.green(categories)],
    ['label', chalk.green(labels)],
    ['time', chalk.green(date)]
  ];

  let question = [{
    type: 'confirm',
    name: 'check',
    message: `最终确认\n${table(allChoices)}`
  }];
  let flag = await prompt(question);
  if (flag.check) return;
  else {
    console.log(chalk.magenta('请重试'));
    process.exit();
  }
}

function doUpLoad() {
  console.log('=====================');
  let loader = [
    '/ 上传中',
    '| 上传中',
    '\\ 上传中',
    '- 上传中'
  ];
  let i = 0;
  let loadingUI = new ui.BottomBar({ bottomBar: loader[i % 4] });
  setInterval(() => { loadingUI.updateBottomBar(loader[i++ % 4]); }, 200);
  let content = readFileSync(filePath).toString();
  let split = FileService.splitContent(content, true);
  section = split.section;
  rest = split.rest;

  return PostService
    .insertPost(title, date, categories, labels, section, rest)
    .then(() => {
      loadingUI.updateBottomBar(chalk.green('上传成功!'));
      return;
    })


}

// function formateChoices(arrays: any[], label: string) {
//   let choiceTable: any[] = arrays
//     .map(value => [value['name'], value['count']]);
//   choiceTable.unshift([label, `此${label}的文章数`]);
//   choiceTable = table(choiceTable, { align: ['l', 'r'] }).split('\n');
//   let tableHead = new Separator(choiceTable[0]);
//   choiceTable.splice(0, 1);
//   let choices: any[] = choiceTable.map((name, i) => {
//     return { name: name, value: arrays[i].name, short: arrays[i].name }
//   });
//   choices.unshift(tableHead, new Separator());
//   return choices;
// }

// function formatePostChoices(posts: IPost[]) {
//   let choiceTable: any[] = posts.map(post => {
//     return [post._id, post.title, post.date];
//   });
//   choiceTable.unshift(['id', 'title', '创建时间']);
//   choiceTable = table(choiceTable, { align: ['l', 'l', 'l'] }).split('\n');
//   let tableHead = new Separator(choiceTable[0]);
//   choiceTable.splice(0, 1);
//   let choices: any[] = choiceTable.map((value, i) => {
//     return { name: value, value: posts[i]._id };
//   });
//   choices.unshift(tableHead, new Separator());
//   return choices;
// }

function de_duplication(array) {
  let result = [];
  for (let a of array) {
    if (result.indexOf(a) == -1)
      result.push(a);
  }
  return result;
}

/**
 * 将这样格式的原始数据: 
 *  {
 *    headers: [{name: 'id', keyName: 'id', align: 'l'}, { name: '标签', keyName: 'name', align: 'l'}],
 *    data: [
 *      { id: '111', name: '222'},
 *      { id: '333', name: '444'}
 *    ],
 *    key: 'id'
 *  }
 *  格式化的:
 *  id   标签
 *  ===============
 *  111  222
 *  333  444
 *  
 * @param {{headers: [{name: string, keyName?: string, align?: string}], data: [{}], key: string}} options
 */
function formatChoices(options) {
  let align = options.headers.map(item => item.align || 'l');
  let choices = options.data.reduce((prev, cur) => {
    let row = [];
    for (let header of options.headers) {
      row.push(cur[header.keyName || header.name]);
    }
    prev.push(row);
    return prev;
  }, [options.headers.map(item => item.name), '']);
  let choiceTable = table(choices, { align });
  choiceTable[0] = new Separator(choiceTable[0]);
  choiceTable[1] = new Separator();
  return choiceTable.reduce((prev, cur, i) => {
    if (i === 0 || i === 1) {
      prev.push(cur);
    } else {
      prev.push({
        name: cur,
        value: data[i - 2][key] || data[i - 2]._id || data[i - 2].id
      });
    }
    return prev
  }, []);
}

