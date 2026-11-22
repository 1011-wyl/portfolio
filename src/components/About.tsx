import { Box, Container, Typography, Grid2 as Grid } from '@mui/material';

const directions = [
  {
    num: '01',
    title: '需求与流程拆解',
    desc: '从直播运营、长篇创作和旅行规划的任务出发，梳理功能边界、用户路径与异常状态，输出产品方案与操作说明。',
  },
  {
    num: '02',
    title: 'AI 质量与能力边界',
    desc: '理解 Agent、RAG、Prompt 与知识管理的应用方式，结合来源核对、人工采纳、一致性检查与调用上限约束生成过程。',
  },
  {
    num: '03',
    title: '原型与交付验证',
    desc: '使用 Xmind、流程图和交互说明表达方案，也能直接制作高保真前端原型；结合 Python、SQL 与接口知识参与联调和验收。',
  },
];

function About(): JSX.Element {
  return (
    <Box component="section" id="about" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left: Intro */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box className="reveal">
              <Typography
                variant="overline"
                sx={{ color: '#8ba8c0', fontSize: '0.75rem', letterSpacing: '0.12em', fontFamily: '"SF Mono", "Fira Code", monospace', mb: 1, display: 'block' }}
              >
                ABOUT
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                从用户任务出发
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #8fa4b8, #a8bcc8)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {' '}做出可用的 AI 产品
                </Box>
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.9, mb: 2 }}>
                集美大学数据科学与大数据技术专业本科生，求职方向为 AI 产品经理。以 OmniStream 实习、NovelAI 和 TravelAI 为主要案例，展示业务流程、人机协作与体验完善方面的实践。
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.9, mb: 2 }}>
                实习中负责商品管理、知识库与智能对话模块迭代，关注商品事实、SKU 信息和 AI 生成结果之间的关系。个人项目中，从流程设计继续推进到可交互页面、功能实现和验证。
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.9 }}>
                熟悉 Python、LangGraph、SQL，了解 SSE 与 WebSocket 等协作机制，能与研发讨论技术边界和异常处理。连续 4 年获专业三等奖学金，获数学统计建模比赛省级二等奖。
              </Typography>
            </Box>
          </Grid>

          {/* Right: Direction cards */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {/* Featured card — spans full width */}
              <Box
                className="glass-hover"
                sx={{
                  gridColumn: { sm: 'span 2' },
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid rgba(143,164,184,0.08)',
                  background: 'rgba(143,164,184,0.04)',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '30%',
                    left: '40%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle at center, rgba(160,216,240,0.05) 0%, transparent 60%)',
                    pointerEvents: 'none',
                  },
                }}
              >
                <Typography variant="body2" sx={{ position: 'relative', zIndex: 1, color: '#8ba8c0', fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: '0.7rem', mb: 0.5 }}>
                  PHILOSOPHY
                </Typography>
                <Typography component="h4" variant="body1" sx={{ position: 'relative', zIndex: 1, fontSize: '1rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.7 }}>
                  让用户看懂过程、控制修改，并完成实际任务
                </Typography>
              </Box>

              {/* Direction cards */}
              {directions.map((dir) => (
                <Box
                  key={dir.title}
                  className="glass-hover"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid rgba(143,164,184,0.08)',
                    background: 'rgba(143,164,184,0.04)',
                    backdropFilter: 'blur(12px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '150%',
                      height: '150%',
                      transform: 'translate(-50%, -50%)',
                      background: 'radial-gradient(circle at center, rgba(160,216,240,0.04) 0%, transparent 60%)',
                      opacity: 0,
                      transition: 'opacity 0.5s ease',
                      pointerEvents: 'none',
                    },
                    '&:hover::before': { opacity: 1 },
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#8ba8c0', fontFamily: 'monospace', fontSize: '0.75rem', mb: 1 }}>
                      {dir.num}
                    </Typography>
                    <Typography component="h4" variant="body1" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      {dir.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.7 }}>
                      {dir.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default About;
