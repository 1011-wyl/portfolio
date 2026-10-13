import { Box, Container, Typography } from '@mui/material';

const milestones = [
  {
    time: '2026.07 - 2026.10',
    title: 'AI 应用开发实习生',
    place: '厦门修蓁慧进科技有限公司',
    detail: '参与直播电商复盘系统：基于 LangGraph 搭建主智能体与 5 类业务子智能体，统一 SSE 双通道事件流，并建设 BGE-M3 + BM25 + RRF 商品知识检索与复盘回流闭环。',
  },
  {
    time: '2026.02 - 至今',
    title: '独立项目持续迭代',
    place: 'NovelAI / TravelAI / 月下疑局',
    detail: '围绕长时工作流、多智能体协作、复杂状态机和外部工具降级，持续完成产品实现、文档维护与回归验证。',
  },
  {
    time: '2023.09 - 2027.06',
    title: '数据科学与大数据技术 · 本科',
    place: '集美大学',
    detail: '连续 3 年获得专业三等奖学金；第十一届数学统计建模比赛省级二等奖；参与方言智能体科研与大学生创新创业训练计划。',
  },
];

function Experience(): JSX.Element {
  return (
    <Box component="section" id="experience" sx={{ py: { xs: 7, md: 11 } }}>
      <Container maxWidth="lg">
        <Box className="reveal" sx={{ display: { md: 'grid' }, gridTemplateColumns: '.72fr 1.28fr', gap: 8 }}>
          <Box>
            <Typography sx={{ color: '#72e0cf', fontFamily: 'monospace', fontSize: '.74rem', letterSpacing: '.12em', mb: 1 }}>BACKGROUND</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}>从数据科学走向 Agent 工程</Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.9 }}>学习、实习与独立开发始终围绕一件事：让模型能力进入稳定、可验证的业务流程。</Typography>
          </Box>
          <Box sx={{ mt: { xs: 4, md: 0 }, position: 'relative', '&::before': { content: '""', position: 'absolute', left: 6, top: 10, bottom: 10, width: '1px', bgcolor: 'rgba(114,224,207,.2)' } }}>
            {milestones.map((item) => (
              <Box key={item.time} sx={{ position: 'relative', pl: 4, pb: 4, '&:last-child': { pb: 0 } }}>
                <Box sx={{ position: 'absolute', left: 1.5, top: 7, width: 10, height: 10, borderRadius: '50%', bgcolor: '#72e0cf', boxShadow: '0 0 15px rgba(114,224,207,.55)' }} />
                <Typography sx={{ color: '#72e0cf', fontFamily: 'monospace', fontSize: '.75rem' }}>{item.time}</Typography>
                <Typography variant="h3" sx={{ fontSize: '1.3rem', mt: .7 }}>{item.title}</Typography>
                <Typography sx={{ color: 'rgba(231,240,241,.72)', mt: .4 }}>{item.place}</Typography>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.85, mt: 1.2, maxWidth: 720 }}>{item.detail}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Experience;
