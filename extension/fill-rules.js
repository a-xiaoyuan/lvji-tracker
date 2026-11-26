// 履迹助手 · 网申填表的字段识别规则（纯逻辑，方便单测）
// 给一个表单字段旁边的文字（标签 / 占位符 / 字段名），返回它对应个人档案里的哪个字段；认不出返回空。
// 顺序很重要：先具体的、后宽泛的。
const LV_FILL_RULES = [
  [/姓名|名字|name/i, 'name'],
  [/手机|电话|phone|mobile/i, 'phone'],
  [/邮箱|邮件|e-?mail/i, 'email'],
  [/学校|院校|school|university/i, 'school'],
  [/专业|major/i, 'major'],
  [/学历|学位|degree|education/i, 'degree'],
  [/毕业|graduat/i, 'gradYear'],
  [/gpa|绩点|成绩/i, 'gpa'],
  [/英语|外语|english|cet/i, 'english'],
  [/薪资|期望.*薪|salary/i, 'salary'],
  [/城市|意向地|期望.*地|location|现居/i, 'cities'],
  [/岗位|意向.*职|目标|position/i, 'target'],
];
function lvFieldFor(text) {
  const t = String(text || '');
  if (!t) return '';
  for (const [re, k] of LV_FILL_RULES) if (re.test(t)) return k;
  return '';
}
