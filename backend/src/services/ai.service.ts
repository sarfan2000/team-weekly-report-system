import axios from 'axios';
import { Report } from '../models/Report';
import { ReportStatus } from '../types';
import { startOfWeek, endOfWeek } from 'date-fns';
import { AppError } from '../utils/errors';

export const processQuery = async (query: string) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AppError(
      'AI service is not configured. Please set OPENAI_API_KEY environment variable.',
      503
    );
  }

  // Drop the strict startOfWeek/endOfWeek filters which causes reports pushed slightly in the future/past to disappear
  // Instead grab the 50 most recent relevant reports (Gemini 2.5 context is massive anyway)
  const reports = await Report.find({
    status: { $in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED, ReportStatus.NEEDS_CORRECTION] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('userId', 'name email')
    .populate('projectId', 'name');

  // Build context from reports
  const context = reports
    .map((report: any) => {
      const blockers = report.blockers
        .map((b: any) => `- ${b.text} ${b.isKeyIssue ? '(KEY ISSUE)' : ''}`)
        .join('\n');

      const achievements = report.achievements
        .map((a: any) => `- ${a.text} ${a.isKeyAchievement ? '(KEY)' : ''}`)
        .join('\n');

      const totalHours =
        report.hoursBreakdown.development +
        report.hoursBreakdown.testing +
        report.hoursBreakdown.meetings +
        report.hoursBreakdown.documentation +
        report.hoursBreakdown.other;

      return `
Report by ${report.userId?.name} (${report.projectId?.name}):
Status: ${report.status}
Total Hours: ${totalHours}h
Blockers:
${blockers || 'None'}
Achievements:
${achievements || 'None'}
Tasks: ${report.tasks.length} total, ${report.tasks.filter((t: any) => t.status === 'COMPLETED').length} completed
`;
    })
    .join('\n---\n');

  // Call Google Gemini API
  try {
    const prompt = `You are an Executive AI assistant helping a manager analyze their team's weekly reports. 
Whenever asked for a summary or insights, explicitly focus on:
1. Highlighting completed work and key achievements.
2. Identifying recurring open blockers across the team.
3. Detecting workload imbalances (e.g., one person doing significantly more hours/tasks than others).

Here are the most recent team reports:

${context}

Manager's question: ${query}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return {
      answer: response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.',
      context: {
        reportsAnalyzed: reports.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Gemini API error:', error.response?.data || error.message);

    if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('API key')) {
      throw new AppError('Invalid Gemini API key', 503);
    }

    const geminiError = error.response?.data?.error?.message || error.message;
    throw new AppError(`Gemini Error: ${geminiError}`, 500);
  }
};
