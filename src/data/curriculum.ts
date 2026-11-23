import type { Lesson } from './types';

export const lessons: Lesson[] = [
  {
    id: 'first-program',
    order: 1,
    module: 'First steps',
    title: 'Your first runnable program',
    duration: 6,
    summary: 'Understand the shape of a C program and make the compiler work for you.',
    objectives: ['Identify the main function', 'Print a line of text', 'Explain a successful exit status'],
    sections: [
      {
        heading: 'A program has an entry point',
        body: 'Every C program begins at main. The operating system hands control to this function, and the statements inside run from top to bottom.',
      },
      {
        heading: 'Headers provide tools',
        body: 'The stdio.h header declares input and output functions. Including it lets the compiler check how printf is supposed to be called.',
      },
      {
        heading: 'Return zero means success',
        body: 'The return value is a small status message for the operating system. Zero is the conventional way to say that the program finished normally.',
      },
    ],
    code: String.raw`#include <stdio.h>

int main(void) {
    printf("Loopcraft is ready.\n");
    return 0;
}`,
    expectedOutput: 'Loopcraft is ready.',
    takeaway: 'A minimal C program needs a header for the functions it uses, a main function, and a return status.',
  },
  {
    id: 'variables',
    order: 2,
    module: 'First steps',
    title: 'Values that change',
    duration: 8,
    summary: 'Store numbers and characters in variables, then protect values that should stay fixed.',
    objectives: ['Choose useful data types', 'Assign and update values', 'Use const for fixed values'],
    sections: [
      {
        heading: 'Types describe the value',
        body: 'An int stores a whole number, a double stores a number with a fractional part, and a char stores one character. Pick the smallest type that honestly describes your data.',
      },
      {
        heading: 'Variables are named storage',
        body: 'A declaration creates a variable and gives it a type. Assignment puts a value into that storage, and the program can read it later.',
      },
      {
        heading: 'const protects intent',
        body: 'When a value should not change, const tells both you and the compiler. Attempting to modify it becomes a compile-time error.',
      },
    ],
    code: String.raw`#include <stdio.h>

int main(void) {
    int lessons = 3;
    double minutes = 7.5;
    char grade = 'A';
    const int target = 5;

    lessons = lessons + 2;
    printf("Lessons: %d\n", lessons);
    printf("Session: %.1f minutes\n", minutes);
    printf("Grade: %c, target: %d\n", grade, target);
    return 0;
}`,
    expectedOutput: 'Lessons: 5\nSession: 7.5 minutes\nGrade: A, target: 5',
    takeaway: 'Choose a type that matches the meaning of a value, and use const when mutation would be a mistake.',
  },
  {
    id: 'input-output',
    order: 3,
    module: 'First steps',
    title: 'A program that listens',
    duration: 9,
    summary: 'Read structured input with scanf and format clear output with printf.',
    objectives: ['Read an integer from standard input', 'Match format specifiers to types', 'Produce predictable output'],
    sections: [
      {
        heading: 'Standard input is a stream',
        body: 'scanf reads values from standard input. Each conversion needs the address of the destination variable, which is why an int argument is written with an ampersand.',
      },
      {
        heading: 'Format specifiers are contracts',
        body: 'Use %d for an int, %f for a double in printf, and %c for a char. A mismatch can produce confusing output or undefined behavior.',
      },
      {
        heading: 'Check important input',
        body: 'For a learning workspace, assume valid input. In a real application, check that scanf read the number of values you expected before using them.',
      },
    ],
    code: String.raw`#include <stdio.h>

int main(void) {
    int pages;
    int pagesPerDay;

    scanf("%d", &pages);
    scanf("%d", &pagesPerDay);
    printf("You need %d study days.\n", pages / pagesPerDay);
    return 0;
}`,
    expectedOutput: 'For input 24 and 6: You need 4 study days.',
    takeaway: 'scanf needs variable addresses, and each format specifier must agree with the variable’s type.',
  },
  {
    id: 'decisions',
    order: 4,
    module: 'Decisions and repetition',
    title: 'Choose a path',
    duration: 9,
    summary: 'Use conditions to make a program respond differently to different inputs.',
    objectives: ['Write if and else branches', 'Combine comparisons', 'Choose switch for fixed options'],
    sections: [
      {
        heading: 'Conditions become yes or no',
        body: 'A comparison such as score >= 60 evaluates to true or false. An if statement runs its body only when that condition is true.',
      },
      {
        heading: 'else covers the alternative',
        body: 'Adding else makes the two paths explicit. Keep branches small and make sure every meaningful case has a home.',
      },
      {
        heading: 'switch handles discrete choices',
        body: 'When a value selects between several fixed cases, switch can be clearer than a long chain of comparisons.',
      },
    ],
    code: String.raw`#include <stdio.h>

int main(void) {
    int score;
    scanf("%d", &score);

    if (score >= 85) {
        printf("Strong work\n");
    } else if (score >= 60) {
        printf("Keep building\n");
    } else {
        printf("Try another practice round\n");
    }
    return 0;
}`,
    expectedOutput: 'For input 72: Keep building',
    takeaway: 'Order conditions from the most specific case to the most general, and cover the remaining cases with else.',
  },
  {
    id: 'loops',
    order: 5,
    module: 'Decisions and repetition',
    title: 'Repeat with intention',
    duration: 10,
    summary: 'Use for and while loops to repeat work without repeating source code.',
    objectives: ['Control a for loop', 'Know when a while loop fits', 'Avoid off-by-one mistakes'],
    sections: [
      {
        heading: 'for packages the loop pieces',
        body: 'Initialization, condition, and update sit together in a for loop. That makes it a natural fit when you know how many repetitions you need.',
      },
      {
        heading: 'while follows a condition',
        body: 'A while loop repeats as long as its condition remains true. It is useful when the number of repetitions depends on changing state.',
      },
      {
        heading: 'Boundaries matter',
        body: 'Decide whether a counter starts at zero or one, and whether the final comparison is < or <=. Most loop bugs begin at those boundaries.',
      },
    ],
    code: String.raw`#include <stdio.h>

int main(void) {
    int total = 0;

    for (int day = 1; day <= 7; day = day + 1) {
        total = total + day;
    }

    printf("Seven-day total: %d\n", total);
    return 0;
}`,
    expectedOutput: 'Seven-day total: 28',
    takeaway: 'Use for for a known count, while for a changing condition, and test the first and last iteration carefully.',
  },
  {
    id: 'while-loops',
    order: 6,
    module: 'Decisions and repetition',
    title: 'Transform a value step by step',
    duration: 9,
    summary: 'Repeatedly reduce a problem until a clear stopping condition is reached.',
    objectives: ['Update loop state', 'Choose a stopping condition', 'Trace a loop by hand'],
    sections: [
      {
        heading: 'Every loop needs progress',
        body: 'If the state never changes in a way that can end the loop, the program can run forever. Make the update visible and easy to verify.',
      },
      {
        heading: 'The remainder operator helps',
        body: 'The % operator gives the remainder of integer division. It is useful for extracting digits and checking divisibility.',
      },
      {
        heading: 'Small traces prevent big confusion',
        body: 'Write down the value of the controlling variable for the first few iterations. A quick paper trace often reveals the exact mistake.',
      },
    ],
    code: String.raw`#include <stdio.h>

int main(void) {
    int value = 942;
    int digitCount = 0;

    while (value > 0) {
        value = value / 10;
        digitCount = digitCount + 1;
    }

    printf("Digits: %d\n", digitCount);
    return 0;
}`,
    expectedOutput: 'Digits: 3',
    takeaway: 'A reliable loop has a condition, a state update, and a stopping point that you can explain in one sentence.',
  },
  {
    id: 'functions',
    order: 7,
    module: 'Functions and collections',
    title: 'Give a job a name',
    duration: 11,
    summary: 'Separate a program into small functions with clear inputs and outputs.',
    objectives: ['Define a function', 'Pass arguments', 'Return a result'],
    sections: [
      {
        heading: 'A function is a reusable contract',
        body: 'The function name should describe the job, parameters should describe the inputs, and the return type should describe the result.',
      },
      {
        heading: 'Local variables keep details contained',
        body: 'Variables declared inside a function belong to that function. This limits how much one part of the program can affect another.',
      },
      {
        heading: 'Return early when it is clearer',
        body: 'If a result is already known, returning it immediately can be easier to read than nesting the rest of the function inside an else branch.',
      },
    ],
    code: String.raw`#include <stdio.h>

int rectangleArea(int width, int height) {
    return width * height;
}

int main(void) {
    int area = rectangleArea(6, 4);
    printf("Area: %d\n", area);
    return 0;
}`,
    expectedOutput: 'Area: 24',
    takeaway: 'A good function does one job, has a truthful name, and communicates through parameters and a return value.',
  },
  {
    id: 'arrays',
    order: 8,
    module: 'Functions and collections',
    title: 'Keep related values together',
    duration: 11,
    summary: 'Store a sequence of values in an array and visit each element with a loop.',
    objectives: ['Declare an array', 'Access elements by index', 'Accumulate a total'],
    sections: [
      {
        heading: 'Indexes start at zero',
        body: 'An array with five elements has valid indexes from 0 through 4. The index is a position, not the value stored there.',
      },
      {
        heading: 'The compiler does not track length',
        body: 'Once an array is passed to a function, it behaves like a pointer. Pass its length separately so loops know where to stop.',
      },
      {
        heading: 'Accumulators begin deliberately',
        body: 'Start a sum at zero and a count at zero. The initial value should make sense even if the array is empty.',
      },
    ],
    code: String.raw`#include <stdio.h>

int main(void) {
    int readings[5] = {18, 21, 19, 24, 22};
    int total = 0;

    for (int i = 0; i < 5; i = i + 1) {
        total = total + readings[i];
    }

    printf("Average: %.1f\n", total / 5.0);
    return 0;
}`,
    expectedOutput: 'Average: 20.8',
    takeaway: 'Arrays group values by position, and every loop over an array needs a correct length boundary.',
  },
  {
    id: 'strings',
    order: 9,
    module: 'Functions and collections',
    title: 'Text, character by character',
    duration: 10,
    summary: 'Treat a C string as a sequence of characters ending with a null marker.',
    objectives: ['Recognize the null terminator', 'Use string.h helpers', 'Walk through characters manually'],
    sections: [
      {
        heading: 'A string is a character array',
        body: 'C represents text as consecutive characters followed by a zero-valued terminator. Functions such as strlen rely on that marker.',
      },
      {
        heading: 'Character constants use single quotes',
        body: "A single character is written as 'a'. A text string uses double quotes, such as \"arena\".",
      },
      {
        heading: 'Manual loops reveal the representation',
        body: 'Walking until the null character makes the storage model concrete and helps you understand what library functions are doing.',
      },
    ],
    code: String.raw`#include <stdio.h>
#include <string.h>

int main(void) {
    char word[] = "practice";
    int vowels = 0;

    for (int i = 0; word[i] != '\0'; i = i + 1) {
        if (word[i] == 'a' || word[i] == 'e' || word[i] == 'i' ||
            word[i] == 'o' || word[i] == 'u') {
            vowels = vowels + 1;
        }
    }

    printf("%s has %d letters and %d vowels.\n", word, (int) strlen(word), vowels);
    return 0;
}`,
    expectedOutput: 'practice has 8 letters and 3 vowels.',
    takeaway: 'C strings end with a null character, so their length is discovered by walking or by using a checked string helper.',
  },
  {
    id: 'pointers',
    order: 10,
    module: 'Memory and structure',
    title: 'Borrow a memory address',
    duration: 13,
    summary: 'Use a pointer to refer to an existing value without making a second copy.',
    objectives: ['Read pointer declarations', 'Use the address-of operator', 'Dereference a pointer safely'],
    sections: [
      {
        heading: 'A pointer stores an address',
        body: 'If value is an int, &value is its address and int *pointer declares a pointer that can hold that kind of address.',
      },
      {
        heading: 'Dereferencing follows the address',
        body: 'Writing *pointer accesses the value stored at the address. It is not multiplication in this context; it means “the value pointed to.”',
      },
      {
        heading: 'Only point to valid storage',
        body: 'A pointer must refer to storage that is still alive. Returning a pointer to a local variable creates a dangling pointer and unsafe behavior.',
      },
    ],
    code: String.raw`#include <stdio.h>

int main(void) {
    int focus = 40;
    int *session = &focus;

    *session = *session + 5;
    printf("Focus level: %d\n", focus);
    return 0;
}`,
    expectedOutput: 'Focus level: 45',
    takeaway: 'A pointer refers to storage rather than owning a copy, so changing the pointed-to value changes the original.',
  },
];

export const lessonModules = [
  { name: 'First steps', description: 'Program shape, values, and input.' },
  { name: 'Decisions and repetition', description: 'Conditions and controlled loops.' },
  { name: 'Functions and collections', description: 'Functions, arrays, and strings.' },
  { name: 'Memory and structure', description: 'Pointers and the road ahead.' },
];

export function getLesson(id: string | undefined) {
  return lessons.find((lesson) => lesson.id === id);
}
