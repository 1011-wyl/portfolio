import { Box, Container, Typography, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import BuildIcon from '@mui/icons-material/Build';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { education } from '../data/repos';

const projectCards = [
  {
    icon: <BuildIcon sx={{ fontSize: 22 }} />,
    title: '厦门修蓁慧进科技有限公司',
    role: 'AI 应用开发实习生',
    period: '2026.07 - 2026.10',
    subtitle: 'LangGraph · RAG · SSE',
    description:
      '面向直播电商复盘与运营迭代，参与搭建“主智能体路由 + 5 类业务子智能体”系统。15 个图节点承载 12 类意图；SSE 与 LangGraph 双事件流统一思考进度、工具调用、文本增量、业务卡片、完成与异常等 8 类事件。知识库采用 BGE-M3 与 BM25 各召回 Top-20，经 RRF 融合输出 Top-8 证据，并形成持续迭代闭环。',
    techStack: ['Python', 'LangGraph', 'SSE', 'BGE-M3', 'BM25', 'RRF', 'RAG'],
  },
  {
    icon: <SmartToyIcon sx={{ fontSize: 22 }} />,
    title: 'NovelAI · 自主长篇小说创作 Agent',
    role: '独立项目',
    period: '2026.02 - 至今',
    subtitle: 'LangGraph · BGE-M3 · Vue 3',
    description:
      '构建覆盖故事规划、资料检索、正文生成、质量审核、自动修订和长期记忆的 Agent 工作流。通过 LangGraph 编排 4 类模型角色与 7 个生产阶段，支持失败重试、状态追踪和原计划复用；使用 SQLite 管理人物关系、世界规则、时间线与伏笔，并通过 BGE-M3 召回相关章节和资料。',
    techStack: ['Python', 'LangGraph', 'Pydantic', 'SQLite', 'RAG', 'BGE-M3', 'Vue 3', 'Docker'],
  },
  {
    icon: <TravelExploreIcon sx={{ fontSize: 22 }} />,
    title: 'TravelAI · 多智能体旅行规划',
    role: '独立项目',
    period: '2026',
    subtitle: 'FastAPI · HelloAgents · MCP · Vue 3',
    description:
      '多智能体个性化旅行规划平台，将城市偏好、地图、天气、预算与行程汇总为可编辑、可追问、可导出的逐日计划。通过 MCP 接入外部工具，WebSocket 流式反馈规划过程，并为地图服务设计多级降级策略。',
    techStack: ['FastAPI', 'HelloAgents', 'MCP', 'WebSocket', 'Vue 3', 'ECharts'],
  },
];

function Timeline(): JSX.Element {
  return (
    <Box component="section" id="timeline" sx={{ py: { xs: 6, md: 10 }, }}>
      <Container maxWidth="md" sx={{ }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }} className="scroll-title-left">
          <Typography
            variant="overline"
            sx={{ color: '#8ba8c0', fontSize: '0.75rem', letterSpacing: '0.12em', fontFamily: '"SF Mono", "Fira Code", monospace' }}
          >
            BACKGROUND
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 700, mt: 0.5 }}>
            教育背景 / 项目经历
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, md: 5 } }}>

          {/* === Education Card === */}
          <Box className="reveal">
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: '1px solid rgba(143,164,184,0.10)',
                background: 'rgba(143,164,184,0.04)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(139,168,192,0.20), rgba(139,168,192,0.08))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#8ba8c0',
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'text.primary' }}>
                      {education[0].school}
                    </Typography>
                    <Typography sx={{ color: '#8ba8c0', fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: '0.72rem' }}>
                      {education[0].period}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#8fa4b8', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
                    {education[0].degree} · {education[0].major}
                  </Typography>
                  {education[0].description && (
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.8 }}>
                      {education[0].description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* === Project Experience Cards === */}
          {projectCards.map((card) => (
            <Box key={card.title} className="reveal">
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: '1px solid rgba(143,164,184,0.10)',
                  background: 'rgba(143,164,184,0.04)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(139,168,192,0.20), rgba(139,168,192,0.08))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#8ba8c0',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'text.primary' }}>
                        {card.title}
                      </Typography>
                      <Typography sx={{ color: '#8ba8c0', fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: '0.72rem' }}>
                        {card.period}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#8fa4b8', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
                      {card.role}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.8, mb: 2 }}>
                      {card.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {card.techStack.map((tech) => (
                        <Chip
                          key={tech}
                          label={tech}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(143,164,184,0.08)',
                            color: '#a0b8cc',
                            border: '1px solid rgba(143,164,184,0.15)',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 22,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}

        </Box>
      </Container>
    </Box>
  );
}

export default Timeline;
