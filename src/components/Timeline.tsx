import { Box, Container, Typography, Chip, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { education } from '../data/repos';
import { campusExperience, productCases } from '../data/profile';

const panelStyle = {
  p: { xs: 3, md: 4 }, borderRadius: 3,
  border: '1px solid rgba(143,164,184,0.10)',
  background: 'rgba(143,164,184,0.04)', backdropFilter: 'blur(12px)',
};

function Timeline(): JSX.Element {
  return (
    <Box component="section" id="timeline" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }} className="scroll-title-left">
          <Typography variant="overline" sx={{ color: '#8ba8c0', fontSize: '.75rem', letterSpacing: '.12em', fontFamily: 'monospace' }}>PRODUCT CASES</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 700, mt: .5 }}>实习与产品案例</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
          {productCases.map((item) => (
            <Box key={item.id} id={`case-${item.id}`} className="reveal" sx={panelStyle}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                <Typography variant="h3" sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' }, fontWeight: 700 }}>{item.name}</Typography>
                <Typography sx={{ fontSize: '.75rem', fontFamily: 'monospace', color: '#8ba8c0' }}>{item.period}</Typography>
              </Box>
              <Typography sx={{ fontSize: '.85rem', color: '#a0b8cc', mb: 2 }}>{item.role}</Typography>
              <Typography sx={{ fontSize: '.9rem', color: 'text.secondary', lineHeight: 1.9, mb: 2 }}>{item.context}</Typography>
              <Typography sx={{ fontSize: '.86rem', color: 'text.secondary', lineHeight: 1.9, mb: 2 }}>
                <Box component="strong" sx={{ color: 'text.primary' }}>用户问题：</Box>{item.problem}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: .8, mb: 1.5 }}>
                {item.tags.map((tag) => <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'rgba(143,164,184,.08)', color: '#a0b8cc', border: '1px solid rgba(143,164,184,.15)', fontSize: '.7rem' }} />)}
              </Box>
              <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent', color: 'text.primary', backgroundImage: 'none', '&::before': { display: 'none' }, borderTop: '1px solid rgba(143,164,184,.12)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#a0b8cc' }} />} id={`${item.id}-summary`} aria-controls={`${item.id}-details`} sx={{ px: 0, minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}>
                  <Typography sx={{ fontSize: '.85rem', fontWeight: 600 }}>查看设计方案与交付</Typography>
                </AccordionSummary>
                <AccordionDetails id={`${item.id}-details`} sx={{ px: 0, pb: 0 }}>
                  <Box sx={{ display: 'grid', gap: 2.5 }}>
                    {item.decisions.map((decision) => (
                      <Box key={decision.title}>
                        <Typography component="h4" variant="body1" sx={{ fontSize: '.9rem', fontWeight: 600, mb: .6 }}>{decision.title}</Typography>
                        <Typography sx={{ fontSize: '.86rem', color: 'text.secondary', lineHeight: 1.9 }}>{decision.detail}</Typography>
                      </Box>
                    ))}
                    <Box>
                      <Typography component="h4" variant="body1" sx={{ fontSize: '.9rem', fontWeight: 600, mb: .6 }}>交付与验证</Typography>
                      <Typography sx={{ fontSize: '.86rem', color: 'text.secondary', lineHeight: 1.9 }}>{item.delivery}</Typography>
                    </Box>
                    {(item.previewUrl || item.sourceUrl) && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {item.previewUrl && <Button variant="outlined" size="small" href={item.previewUrl} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon />}>体验交互演示</Button>}
                      {item.sourceUrl && <Button size="small" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">查看项目仓库</Button>}
                    </Box>}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}
          <Box className="reveal" sx={panelStyle}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
              <SchoolIcon sx={{ color: '#8ba8c0' }} />
              <Typography variant="h3" sx={{ fontSize: '1.15rem', fontWeight: 700 }}>教育与在校经历</Typography>
            </Box>
            <Typography sx={{ fontWeight: 600, mb: .5 }}>{education[0].school} · {education[0].major} · {education[0].degree}</Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '.75rem', color: '#8ba8c0', mb: 1.5 }}>{education[0].period}</Typography>
            <Typography sx={{ fontSize: '.86rem', color: 'text.secondary', lineHeight: 1.9 }}>{education[0].description}</Typography>
            <Box sx={{ display: 'grid', gap: 2.5, mt: 3 }}>
              {campusExperience.map((item) => <Box key={item.title}>
                <Typography sx={{ fontSize: '.9rem', fontWeight: 600 }}>{item.title}</Typography>
                <Typography sx={{ fontSize: '.75rem', color: '#8ba8c0', my: .5 }}>{item.role}</Typography>
                <Typography sx={{ fontSize: '.86rem', color: 'text.secondary', lineHeight: 1.9 }}>{item.detail}</Typography>
              </Box>)}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Timeline;
