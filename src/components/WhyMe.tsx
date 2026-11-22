import { Box, Container, Typography } from '@mui/material';

const highlights = [
  {
    num: '30+',
    unit: '',
    label: '业务字段与状态梳理',
    desc: 'OmniStream：支持产研测对齐流程',
  },
  {
    num: '8',
    unit: '维',
    label: '内容质量检查',
    desc: 'NovelAI：结合跨章记忆与人工修订',
  },
  {
    num: '6',
    unit: '区',
    label: '旅行结果呈现',
    desc: 'TravelAI：检查方案、编辑并带走结果',
  },
];

function WhyMe(): JSX.Element {
  return (
    <Box
      component="section"
      id="whyme"
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 1.5, sm: 3 },
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }} className="scroll-title-left">
          <Typography
            variant="overline"
            sx={{
              color: '#8ba8c0',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              fontFamily: '"SF Mono", "Fira Code", monospace',
            }}
          >
            WHY ME
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.6rem', md: '2.2rem' },
              fontWeight: 700,
              mt: 0.5,
              color: '#e8e0d0',
            }}
          >
            把产品方案落实为具体机制
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {highlights.map((h, i) => (
            <Box
              key={h.label}
              className={`scroll-stagger-${i + 1}`}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: '1px solid rgba(143,164,184,0.10)',
                background: 'rgba(143,164,184,0.03)',
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(143,164,184,0.22)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.2rem' },
                  fontWeight: 800,
                  lineHeight: 1,
                  mb: 0.5,
                  background: 'linear-gradient(135deg, #b8c8d8, #d0dce6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {h.num}
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 600,
                    WebkitTextFillColor: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {h.unit}
                </Typography>
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#e8e0d0',
                  mb: 0.5,
                }}
              >
                {h.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.5,
                }}
              >
                {h.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default WhyMe;
