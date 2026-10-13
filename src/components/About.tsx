import { Box, Container, Typography, Grid2 as Grid } from '@mui/material';

const directions = [
  {
    num: '01',
    title: 'Agent 系统开发',
    desc: '使用 LangGraph 设计主智能体路由、业务子智能体、状态检查点与人工审核，能把复杂任务拆成可观测的工作流。',
  },
  {
    num: '02',
    title: 'RAG 与知识工程',
    desc: '实践 BGE-M3、BM25、RRF 融合检索、长期记忆与知识图谱，重视引用溯源、质量检查和持续更新。',
  },
  {
    num: '03',
    title: '全栈产品交付',
    desc: 'Python + TypeScript / Java 双栈实践，覆盖 FastAPI、Vue、React、Spring Boot、数据库设计、测试与部署。',
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
                Agent 编排
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #8fa4b8, #a8bcc8)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {' '}· 工程落地
                </Box>
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.9, mb: 2 }}>
                集美大学数据科学与大数据技术专业，2027 届本科生，目标岗位为 AI 应用开发实习生。持续开发 NovelAI、TravelAI、多智能体游戏与心理咨询平台等项目。
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.9, mb: 2 }}>
                在 AI 应用开发实习中，基于 LangGraph 搭建主智能体与 5 类业务子智能体，通过 15 个图节点承载 12 类意图，并用 SSE / LangGraph 双事件流统一 8 类运行事件。
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.9 }}>
                在知识库链路中使用 BGE-M3 与 BM25 各召回 Top-20，再通过 RRF 融合输出 Top-8 证据。连续三年获专业三等奖学金，并获数学统计建模省级二等奖。
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
                <Typography variant="h4" sx={{ position: 'relative', zIndex: 1, fontSize: '1rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.7 }}>
                  让模型能力进入可追踪、可恢复、可验证的工程流程
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
                    <Typography variant="h4" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
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
