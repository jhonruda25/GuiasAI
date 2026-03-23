import { z } from 'zod';
export declare const ActivityTypeEnum: z.ZodEnum<{
    CROSSWORD: "CROSSWORD";
    WORD_SEARCH: "WORD_SEARCH";
    FILL_BLANKS: "FILL_BLANKS";
    MATCH_CONCEPTS: "MATCH_CONCEPTS";
    BONUS: "BONUS";
    SEQUENTIAL_IMAGE_ANALYSIS: "SEQUENTIAL_IMAGE_ANALYSIS";
    MULTIPLE_CHOICE: "MULTIPLE_CHOICE";
    TRUE_FALSE: "TRUE_FALSE";
    WORD_SCRAMBLE: "WORD_SCRAMBLE";
    DICTATION: "DICTATION";
    SENTENCE_ORDER: "SENTENCE_ORDER";
    ERROR_IDENTIFICATION: "ERROR_IDENTIFICATION";
    TABLE_COMPLETION: "TABLE_COMPLETION";
}>;
export declare const ThemeSettingsSchema: z.ZodObject<{
    primary_color: z.ZodString;
    icon_emoji: z.ZodString;
}, z.core.$strip>;
export declare const ConceptItemSchema: z.ZodObject<{
    word: z.ZodString;
    clue_or_definition: z.ZodString;
}, z.core.$strip>;
export declare const ActivitySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"CROSSWORD">;
    items: z.ZodArray<z.ZodObject<{
        word: z.ZodString;
        clue_or_definition: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"WORD_SEARCH">;
    items: z.ZodArray<z.ZodObject<{
        word: z.ZodString;
        clue_or_definition: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"MATCH_CONCEPTS">;
    pairs: z.ZodArray<z.ZodObject<{
        concept: z.ZodString;
        definition: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"FILL_BLANKS">;
    sentences: z.ZodArray<z.ZodObject<{
        full_sentence: z.ZodString;
        hidden_word: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"SEQUENTIAL_IMAGE_ANALYSIS">;
    image_prompts: z.ZodArray<z.ZodString>;
    questions: z.ZodArray<z.ZodString>;
    generated_images: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"BONUS">;
    challenge: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"MULTIPLE_CHOICE">;
    questions: z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        options: z.ZodArray<z.ZodString>;
        correct_answer: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"TRUE_FALSE">;
    statements: z.ZodArray<z.ZodObject<{
        statement: z.ZodString;
        is_true: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"WORD_SCRAMBLE">;
    words: z.ZodArray<z.ZodObject<{
        word: z.ZodString;
        hint: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"DICTATION">;
    paragraphs: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        word_count: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"SENTENCE_ORDER">;
    sentences: z.ZodArray<z.ZodObject<{
        original: z.ZodString;
        words: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"ERROR_IDENTIFICATION">;
    sentences: z.ZodArray<z.ZodObject<{
        sentence_with_error: z.ZodString;
        errors: z.ZodArray<z.ZodObject<{
            error: z.ZodString;
            correction: z.ZodString;
            explanation: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    instructions: z.ZodString;
    score: z.ZodNumber;
    type: z.ZodLiteral<"TABLE_COMPLETION">;
    table: z.ZodObject<{
        headers: z.ZodArray<z.ZodString>;
        rows: z.ZodArray<z.ZodObject<{
            cells: z.ZodRecord<z.ZodString, z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>], "type">;
export declare const RubricCriteriaSchema: z.ZodObject<{
    activity_type: z.ZodEnum<{
        CROSSWORD: "CROSSWORD";
        WORD_SEARCH: "WORD_SEARCH";
        FILL_BLANKS: "FILL_BLANKS";
        MATCH_CONCEPTS: "MATCH_CONCEPTS";
        BONUS: "BONUS";
        SEQUENTIAL_IMAGE_ANALYSIS: "SEQUENTIAL_IMAGE_ANALYSIS";
        MULTIPLE_CHOICE: "MULTIPLE_CHOICE";
        TRUE_FALSE: "TRUE_FALSE";
        WORD_SCRAMBLE: "WORD_SCRAMBLE";
        DICTATION: "DICTATION";
        SENTENCE_ORDER: "SENTENCE_ORDER";
        ERROR_IDENTIFICATION: "ERROR_IDENTIFICATION";
        TABLE_COMPLETION: "TABLE_COMPLETION";
    }>;
    criteria_description: z.ZodString;
    levels: z.ZodObject<{
        excellent: z.ZodString;
        good: z.ZodString;
        needs_improvement: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const GlobalRubricSchema: z.ZodObject<{
    global_description: z.ZodString;
    criteria: z.ZodArray<z.ZodObject<{
        activity_type: z.ZodEnum<{
            CROSSWORD: "CROSSWORD";
            WORD_SEARCH: "WORD_SEARCH";
            FILL_BLANKS: "FILL_BLANKS";
            MATCH_CONCEPTS: "MATCH_CONCEPTS";
            BONUS: "BONUS";
            SEQUENTIAL_IMAGE_ANALYSIS: "SEQUENTIAL_IMAGE_ANALYSIS";
            MULTIPLE_CHOICE: "MULTIPLE_CHOICE";
            TRUE_FALSE: "TRUE_FALSE";
            WORD_SCRAMBLE: "WORD_SCRAMBLE";
            DICTATION: "DICTATION";
            SENTENCE_ORDER: "SENTENCE_ORDER";
            ERROR_IDENTIFICATION: "ERROR_IDENTIFICATION";
            TABLE_COMPLETION: "TABLE_COMPLETION";
        }>;
        criteria_description: z.ZodString;
        levels: z.ZodObject<{
            excellent: z.ZodString;
            good: z.ZodString;
            needs_improvement: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const WorkGuideSchema: z.ZodObject<{
    topic: z.ZodString;
    target_audience: z.ZodString;
    global_score: z.ZodNumber;
    theme: z.ZodObject<{
        primary_color: z.ZodString;
        icon_emoji: z.ZodString;
    }, z.core.$strip>;
    activities: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"CROSSWORD">;
        items: z.ZodArray<z.ZodObject<{
            word: z.ZodString;
            clue_or_definition: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"WORD_SEARCH">;
        items: z.ZodArray<z.ZodObject<{
            word: z.ZodString;
            clue_or_definition: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"MATCH_CONCEPTS">;
        pairs: z.ZodArray<z.ZodObject<{
            concept: z.ZodString;
            definition: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"FILL_BLANKS">;
        sentences: z.ZodArray<z.ZodObject<{
            full_sentence: z.ZodString;
            hidden_word: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"SEQUENTIAL_IMAGE_ANALYSIS">;
        image_prompts: z.ZodArray<z.ZodString>;
        questions: z.ZodArray<z.ZodString>;
        generated_images: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"BONUS">;
        challenge: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"MULTIPLE_CHOICE">;
        questions: z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            options: z.ZodArray<z.ZodString>;
            correct_answer: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"TRUE_FALSE">;
        statements: z.ZodArray<z.ZodObject<{
            statement: z.ZodString;
            is_true: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"WORD_SCRAMBLE">;
        words: z.ZodArray<z.ZodObject<{
            word: z.ZodString;
            hint: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"DICTATION">;
        paragraphs: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            word_count: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"SENTENCE_ORDER">;
        sentences: z.ZodArray<z.ZodObject<{
            original: z.ZodString;
            words: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"ERROR_IDENTIFICATION">;
        sentences: z.ZodArray<z.ZodObject<{
            sentence_with_error: z.ZodString;
            errors: z.ZodArray<z.ZodObject<{
                error: z.ZodString;
                correction: z.ZodString;
                explanation: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        instructions: z.ZodString;
        score: z.ZodNumber;
        type: z.ZodLiteral<"TABLE_COMPLETION">;
        table: z.ZodObject<{
            headers: z.ZodArray<z.ZodString>;
            rows: z.ZodArray<z.ZodObject<{
                cells: z.ZodRecord<z.ZodString, z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>], "type">>;
    global_rubric: z.ZodObject<{
        global_description: z.ZodString;
        criteria: z.ZodArray<z.ZodObject<{
            activity_type: z.ZodEnum<{
                CROSSWORD: "CROSSWORD";
                WORD_SEARCH: "WORD_SEARCH";
                FILL_BLANKS: "FILL_BLANKS";
                MATCH_CONCEPTS: "MATCH_CONCEPTS";
                BONUS: "BONUS";
                SEQUENTIAL_IMAGE_ANALYSIS: "SEQUENTIAL_IMAGE_ANALYSIS";
                MULTIPLE_CHOICE: "MULTIPLE_CHOICE";
                TRUE_FALSE: "TRUE_FALSE";
                WORD_SCRAMBLE: "WORD_SCRAMBLE";
                DICTATION: "DICTATION";
                SENTENCE_ORDER: "SENTENCE_ORDER";
                ERROR_IDENTIFICATION: "ERROR_IDENTIFICATION";
                TABLE_COMPLETION: "TABLE_COMPLETION";
            }>;
            criteria_description: z.ZodString;
            levels: z.ZodObject<{
                excellent: z.ZodString;
                good: z.ZodString;
                needs_improvement: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type WorkGuide = z.infer<typeof WorkGuideSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type ConceptItem = z.infer<typeof ConceptItemSchema>;
