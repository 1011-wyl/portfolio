'use client';

import { useState } from 'react';

const SECTIONS = [
  {
    id: 'roles',
    label: '板子阵容',
    items: [
      {
        title: '12人 · 镜隐迷踪（屠边局）',
        body: '3 名普通狼人 + 1 名觉醒隐狼 + 4 名村民 + 魔镜少女、女巫、猎人、守卫各 1 名。好人需放逐全部狼人；狼人需击杀全部村民或全部神职。',
      },
      {
        title: '觉醒隐狼（核心机制）',
        body: '与普通狼人互不相认、不参与狼队密谈；普通狼人全部出局后才获得狼刀。一局一次可模仿任意玩家，立即得知并伪装其身份，当夜结束后获得对应技能（魔镜查身份、女巫一毒、守卫可挡刀与毒、猎人非毒可开枪、狼人获得一次额外刀）。',
      },
      {
        title: '魔镜少女 · 女巫 · 守卫 · 猎人',
        body: '魔镜少女每夜查验一人具体身份（不可重复；查已模仿的隐狼会显示其模仿身份）。女巫全程不可自救、每夜至多一药。守卫可自守但不可连守，同守同救仍死。猎人被毒死不能开枪。',
      },
    ],
  },
  {
    id: 'flow',
    label: '竞选与投票',
    items: [
      {
        title: '全员同时报名上警',
        body: '首夜行动后全员同时独立决定是否上警，确认完毕后统一公布名单，随后进行警上发言、退水与警下投票，竞选结束后才公布昨夜出局信息。',
      },
      {
        title: '5秒同时投票制',
        body: '警长投票与放逐投票均采用 5 秒并发窗口。截止后未提交视为弃票，票型统一公布；平票先 PK 一轮，再平票则警徽流失或无人放逐。警长拥有 1.5 票放逐权重。',
      },
      {
        title: '自爆与遗言',
        body: '普通狼人可自刀与白天自爆（觉醒隐狼不可自爆）。警上连续两次自爆将吞没警徽。首夜出局及白天放逐可留遗言；手动点击「下一位」推进每段公开发言。',
      },
    ],
  },
];

export function RulesContent() {
  const [tab, setTab] = useState<'roles' | 'flow'>('roles');
  const current = SECTIONS.find((s) => s.id === tab) || SECTIONS[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#090e17] p-1 border border-slate-800/80">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id as 'roles' | 'flow')}
            className={`min-h-[40px] rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors ${
              tab === s.id
                ? 'bg-[#1b273a] text-[#e6d5ad]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {current.items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800/80 bg-[#141e2e]/70 p-4"
          >
            <h3 className="text-sm font-semibold text-[#e6d5ad]">
              {item.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
