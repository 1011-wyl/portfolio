import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, TextField, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  { label: '最有挑战的项目', prompt: '你做过的项目里，技术上最有挑战的是哪个？难在哪？' },
  { label: '为什么选 AI 方向', prompt: '你为什么选择 AI 应用开发作为求职方向？' },
  { label: '一个人怎么做的', prompt: '这些项目是你一个人完成的吗？遇到不会的技术怎么解决？' },
  { label: '成本控制', prompt: '你的项目在 API 调用和部署上怎么控制成本的？' },
  { label: '和别人有什么不同', prompt: '跟同届应届生比，你觉得自己最大的优势是什么？' },
];

const ANSWERS = {
  challenge:
    '目前最有挑战的是 NovelAI。长篇生成并不是一次提示词调用，而是要同时处理跨章节一致性、世界规则、人物关系、伏笔和失败恢复。我用 LangGraph 把规划、写作、审核、修订拆成 7 个阶段，由 4 类模型角色协作；再用 SQLite 保存结构化长期记忆，并通过 BGE-M3 召回相关章节与资料。这样每一步都能追踪、重试，也能保留人工审批。',
  direction:
    '我喜欢把模型能力变成真正可使用的产品。在实习里，我参与了主智能体路由与 5 类业务子智能体的系统开发，15 个图节点承载 12 类意图；项目里也持续实践 Agent、RAG、SSE / WebSocket 与全栈交付。相比只做模型调用，我更关注任务编排、状态恢复、证据质量和用户体验。',
  ownership:
    'NovelAI、TravelAI、月下疑局和心理咨询平台都是我持续主导开发的项目。我会先把业务目标拆成可验证的小闭环，再查阅官方文档、复现最小样例并补测试。遇到不熟悉的技术时，我会记录假设、做对照实验，并用日志和回归用例确认方案不是“碰巧能跑”。',
  cost:
    '我会把成本控制放进架构里：优先用规则和上下文完成明确判断，再把真正需要语义理解的任务交给模型；对检索结果先做融合与裁剪，只把 Top-8 高价值证据送入上下文；长任务采用流式反馈、检查点和失败恢复，避免断线或重试导致整条链路重复消耗。',
  advantage:
    '我的优势是把 AI 能力、后端工程和前端体验放在同一个交付闭环里。实习中做过 LangGraph 多智能体与双事件流，个人项目覆盖 RAG、知识图谱、状态机和全栈系统；同时连续三年获专业三等奖学金，并获数学统计建模省级二等奖。我希望用这些经历证明自己不只会做 Demo，也能处理真实系统里的状态、质量和异常。',
  default:
    '你可以问我关于 NovelAI、TravelAI、月下疑局、心理咨询平台、LangGraph、RAG、实习经历或求职方向的问题。这个公开版本使用基于简历事实的本地回答，不会上传你的输入。',
};

function answerFor(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('挑战') || q.includes('novel') || q.includes('小说')) return ANSWERS.challenge;
  if (q.includes('为什么') || q.includes('方向') || q.includes('ai')) return ANSWERS.direction;
  if (q.includes('一个人') || q.includes('独立') || q.includes('不会')) return ANSWERS.ownership;
  if (q.includes('成本') || q.includes('api') || q.includes('部署')) return ANSWERS.cost;
  if (q.includes('优势') || q.includes('不同') || q.includes('同届')) return ANSWERS.advantage;
  return ANSWERS.default;
}

function AiChat(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);

    setLoading(true);
    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const answer = answerFor(trimmed);
      await new Promise((resolve) => setTimeout(resolve, 320));
      for (let end = 4; end < answer.length + 4; end += 4) {
        const content = answer.slice(0, end);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content };
          }
          return updated;
        });
        await new Promise((resolve) => setTimeout(resolve, 14));
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '回答加载失败，请点击预设问题重试。' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      component="section"
      id="ai-chat"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 3 },
        position: 'relative',
      }}
    >
      <Box
        className="reveal"
        sx={{
          width: '100%',
          maxWidth: 800,
          height: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 48px)' },
          maxHeight: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 48px)' },
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          backgroundColor: 'rgba(143,164,184,0.03)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(143,164,184,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 1.8,
            borderBottom: '1px solid rgba(143,164,184,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"SF Mono", "Fira Code", monospace',
              fontSize: '0.75rem',
              color: '#8ba8c0',
              letterSpacing: '0.12em',
              fontWeight: 600,
            }}
          >
            AI CHAT
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              fontWeight: 700,
              color: '#e8e0d0',
              lineHeight: 1.3,
            }}
          >
            AI 对话
          </Typography>
        </Box>

        {/* Messages */}
        <Box
          ref={listRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: { xs: 2.5, sm: 3.5 },
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': { width: 3 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(143,164,184,0.2)',
              borderRadius: 2,
            },
          }}
        >
          {/* Empty state — clean welcome */}
          {messages.length === 0 && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              {/* Greeting */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.8rem' },
                    fontWeight: 700,
                    color: '#e8e0d0',
                    mb: 1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  你好，随便问
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: '0.82rem', sm: '0.88rem' },
                    color: 'rgba(255,255,255,0.3)',
                    lineHeight: 1.6,
                  }}
                >
                  关于项目经历、技术选型与求职方向
                </Typography>
              </Box>

              {/* Prompt cards — 2-column grid, clearly interactive */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                  width: '100%',
                  maxWidth: 480,
                }}
              >
                {QUICK_PROMPTS.map((qp) => (
                  <Box
                    key={qp.label}
                    component="button"
                    onClick={() => !loading && sendMessage(qp.prompt)}
                    disabled={loading}
                    sx={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      border: '1px solid rgba(143,164,184,0.10)',
                      backgroundColor: 'rgba(143,164,184,0.03)',
                      cursor: loading ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: loading ? 0.4 : 1,
                      '&:hover': {
                        backgroundColor: 'rgba(143,164,184,0.08)',
                        borderColor: 'rgba(143,164,184,0.22)',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#8ba8c0',
                        opacity: 0.5,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.55)',
                        fontWeight: 500,
                        textAlign: 'left',
                        lineHeight: 1.4,
                        '&:hover': { color: '#e8e0d0' },
                      }}
                    >
                      {qp.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: { xs: '88%', sm: '75%' },
                animation: 'fadeInUp 0.3s ease-out',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  color: msg.role === 'user' ? 'rgba(143,164,184,0.55)' : 'rgba(143,164,184,0.45)',
                  mb: 0.4,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                }}
              >
                {msg.role === 'user' ? '你' : 'AI'}
              </Typography>
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  backgroundColor:
                    msg.role === 'user'
                      ? 'rgba(143,164,184,0.12)'
                      : 'rgba(255,255,255,0.05)',
                  border: '1px solid',
                  borderColor: msg.role === 'user'
                    ? 'rgba(143,164,184,0.15)'
                    : 'rgba(255,255,255,0.06)',
                }}
              >
                <Typography
                  sx={{
                    color: msg.role === 'user' ? '#d0d8e0' : '#c0c8d0',
                    fontSize: { xs: '0.82rem', sm: '0.87rem' },
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                  {loading && i === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
                    <Box component="span" sx={{ display: 'inline-flex', gap: 0.4, ml: 0.5, verticalAlign: 'middle' }}>
                      {[0, 0.2, 0.4].map((d) => (
                        <Box
                          key={d}
                          component="span"
                          sx={{
                            animation: 'dotPulse 1.4s infinite both',
                            animationDelay: `${d}s`,
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(143,164,184,0.6)',
                            display: 'inline-block',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Persistent quick prompts — only show after messages exist */}
        {messages.length > 0 && (
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 1,
              borderTop: '1px solid rgba(143,164,184,0.06)',
              display: 'flex',
              gap: 0.6,
              overflowX: 'auto',
              flexShrink: 0,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {QUICK_PROMPTS.map((qp) => (
              <Box
                key={qp.label}
                onClick={() => !loading && sendMessage(qp.prompt)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  border: '1px solid rgba(143,164,184,0.12)',
                  backgroundColor: 'rgba(143,164,184,0.05)',
                  color: 'rgba(200,208,216,0.55)',
                  fontSize: '0.72rem',
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  lineHeight: 1.4,
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  opacity: loading ? 0.4 : 1,
                  '&:hover': {
                    backgroundColor: 'rgba(143,164,184,0.1)',
                    borderColor: 'rgba(143,164,184,0.25)',
                    color: '#e8e0d0',
                  },
                }}
              >
                {qp.label}
              </Box>
            ))}
          </Box>
        )}

        {/* Input bar */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.2,
            borderTop: '1px solid rgba(143,164,184,0.06)',
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
            backgroundColor: 'rgba(10,10,10,0.4)',
            flexShrink: 0,
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="输入你想了解的内容…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                color: '#e0e4e8',
                fontSize: '0.85rem',
                backgroundColor: 'rgba(143,164,184,0.06)',
                borderRadius: 2,
                px: 1.5,
                py: 0.8,
                border: '1px solid rgba(143,164,184,0.1)',
                '&::placeholder': { color: 'rgba(255,255,255,0.25)' },
                '&:focus-within': {
                  borderColor: 'rgba(143,164,184,0.25)',
                },
              },
            }}
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: 'rgba(143,164,184,0.06)',
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            sx={{
              width: 38,
              height: 38,
              border: '1px solid rgba(143,164,184,0.18)',
              backgroundColor: loading || !input.trim()
                ? 'rgba(10,10,10,0.25)'
                : 'rgba(10,10,10,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: input.trim() ? '#c8d8e8' : 'rgba(200,216,232,0.22)',
              '&:hover': {
                backgroundColor: 'rgba(10,10,10,0.80)',
                borderColor: '#8ba8c0',
                color: '#fff',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(10,10,10,0.25)',
                borderColor: 'rgba(143,164,184,0.06)',
                color: 'rgba(200,216,232,0.1)',
              },
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: '#8fa4b8' }} />
            ) : (
              <SendIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default AiChat;
