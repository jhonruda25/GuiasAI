import type { Activity } from '@repo/schemas';

type MultipleChoice = Extract<Activity, { type: 'MULTIPLE_CHOICE' }>;

export function MultipleChoiceActivity({ activity }: { activity: MultipleChoice }) {
    return (
        <div className="space-y-4 text-sm mt-3">
            {activity.questions.map((question, i) => (
                <div key={i} className="space-y-2">
                    <p className="font-semibold">{i + 1}. {question.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                        {question.options.map((option, j) => (
                            <label key={j} className="flex items-start space-x-2">
                                <span className="w-5 h-5 rounded-full border border-black flex-shrink-0 mt-0.5 inline-flex items-center justify-center text-xs">
                                    {String.fromCharCode(65 + j)}
                                </span>
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
