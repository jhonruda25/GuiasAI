import type { Activity } from '@repo/schemas';

interface Props {
  activity: Extract<Activity, { type: 'TRUE_FALSE' }>;
  language?: string;
}

export function TrueFalseActivity({ activity, language }: Props) {
    const isEn = language === 'en';

    return (
        <div className="space-y-4 text-sm mt-3">
            <table className="w-full border-collapse">
                <tbody>
                    {activity.statements.map((statement, i) => (
                        <tr key={i} className="border-b border-gray-300">
                            <td className="py-3 pr-4 align-top w-5 text-gray-500 font-bold">{i + 1}.</td>
                            <td className="py-3 pr-4">{statement.statement}</td>
                            <td className="py-3 w-16 whitespace-nowrap text-right font-medium">
                                ( {language === 'en' ? 'T' : ' V '} ) ( F )
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-dashed border-gray-400">
                <p className="italic text-gray-600 mb-2">
                    {language === 'en' ? 'Justify the false statements:' : 'Justifica las respuestas falsas:'}
                </p>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="border-b border-black w-full h-5"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
