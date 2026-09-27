"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  TrendingUp,
  WalletCards,
} from "lucide-react";

type ResourceLink = {
  label: string;
  url: string;
};

type QuickCheck = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type Resource = {
  id: string;
  title: string;
  category: string;
  introduction: string;
  paragraphs: string[];
  tips: string[];
  links: ResourceLink[];
  quickCheck: QuickCheck;
};

type GlossaryItem = {
  term: string;
  definition: string;
  example: string;
};

const resources: Resource[] = [
  {
    id: "budgeting",
    title: "Budgeting",
    category: "Money Management",
    introduction:
      "A budget is a simple plan that helps students understand how much money they receive, where their money is spent, and how much money remains.",
    paragraphs: [
      "Students can begin by listing their regular income, such as wages, scholarships, or Student Allowance. They can then compare their income with regular expenses such as rent, groceries, transport, utilities, and study costs.",
      "Tracking actual spending is important because planned expenses and real spending may be different. Reviewing a budget regularly can help students identify unnecessary spending and prepare for unexpected costs.",
    ],
    tips: [
      "Separate essential and optional expenses.",
      "Set aside some money for unexpected costs.",
      "Review your budget when your income or expenses change.",
    ],
    links: [
      {
        label: "Sorted – Budgeting",
        url: "https://sorted.org.nz/guides/planning-and-budgeting/",
      },
    ],
    quickCheck: {
      question:
        "A student receives $2,000 each month and finds that optional spending is making it difficult to save. Which action would most directly help improve their budget?",
      options: [
        "Increase entertainment spending",
        "Reduce some optional expenses",
        "Stop tracking expenses",
        "Ignore the budget until next semester",
      ],
      correctAnswer: 1,
      explanation:
        "Reducing optional expenses can leave more money available for savings while keeping essential costs covered.",
    },
  },

  {
    id: "scholarship-applications",
    title: "Scholarship Applications",
    category: "Student Support",
    introduction:
      "Scholarships can help students cover tuition fees, living costs, course materials, and other study-related expenses.",
    paragraphs: [
      "Scholarship requirements are different depending on the provider. Some scholarships consider academic results, while others may consider financial circumstances, community involvement, leadership, or the subject being studied.",
      "Students should carefully read the eligibility requirements and prepare all required documents before the closing date. Common documents may include academic records, personal statements, references, and evidence of achievements.",
    ],
    tips: [
      "Check the scholarship closing date early.",
      "Read all eligibility requirements carefully.",
      "Ask someone to review your application before submitting it.",
    ],
    links: [
      {
        label: "AUT Scholarships",
        url: "https://www.aut.ac.nz/study/fees-and-scholarships/scholarships-and-awards-at-aut",
      },
    ],
    quickCheck: {
      question:
        "A scholarship closes in two weeks and requires a reference and personal statement. What should the student do first?",
      options: [
        "Wait until the final day",
        "Confirm the eligibility requirements and begin preparing documents",
        "Submit without a reference",
        "Apply without reading the conditions",
      ],
      correctAnswer: 1,
      explanation:
        "Checking eligibility and preparing required documents early reduces the risk of an incomplete or late application.",
    },
  },

  {
    id: "student-allowance",
    title: "Student Allowance",
    category: "Student Support",
    introduction:
      "Student Allowance is financial support that may help eligible students with their living costs while studying.",
    paragraphs: [
      "Eligibility may depend on factors such as the student's age, study programme, income, parents' income, relationship status, and living situation.",
      "Students should apply early because applications and supporting documents may take time to process. Students must also report relevant changes to their circumstances.",
    ],
    tips: [
      "Apply before your study begins where possible.",
      "Prepare the required supporting documents.",
      "Report changes to your income or living situation.",
    ],
    links: [
      {
        label: "StudyLink – Student Allowance",
        url: "https://www.studylink.govt.nz/products/a-z-products/student-allowance/index.html",
      },
    ],
    quickCheck: {
      question:
        "A student has already applied for Student Allowance but their living situation changes. What should they do?",
      options: [
        "Ignore the change",
        "Wait until the end of the year",
        "Report the relevant change",
        "Create a new application without checking",
      ],
      correctAnswer: 2,
      explanation:
        "Relevant changes to circumstances should be reported because they may affect Student Allowance eligibility or payments.",
    },
  },

  {
    id: "managing-remittances",
    title: "Managing Remittances",
    category: "Money Transfer",
    introduction:
      "A remittance is money transferred to another person, often between different countries.",
    paragraphs: [
      "International money transfers may include transfer fees, exchange-rate differences, and receiving fees. The amount received may therefore be lower than the amount originally sent.",
      "Before making a transfer, students should compare the total cost, expected delivery time, exchange rate, and security of the transfer provider.",
    ],
    tips: [
      "Compare the final amount that the recipient will receive.",
      "Check transfer fees and exchange rates.",
      "Use a trusted and secure transfer provider.",
    ],
    links: [
      {
        label: "Consumer Protection New Zealand",
        url: "https://www.consumerprotection.govt.nz/",
      },
    ],
    quickCheck: {
      question:
        "Provider A has a lower transfer fee but a worse exchange rate than Provider B. What is the best way to compare them?",
      options: [
        "Choose the provider with the lowest fee only",
        "Compare the final amount the recipient will receive",
        "Choose the provider with the best-looking website",
        "Ignore the exchange rate",
      ],
      correctAnswer: 1,
      explanation:
        "The final amount received reflects both fees and exchange rates, so it gives a better comparison of the overall transfer value.",
    },
  },

  {
    id: "currency-conversions",
    title: "Currency Conversions",
    category: "Money Transfer",
    introduction:
      "Currency conversion is the process of changing money from one currency into another currency.",
    paragraphs: [
      "Currency exchange rates can change over time. Banks and transfer providers may also use different exchange rates and charge additional fees.",
      "Students receiving money from overseas should check both the advertised exchange rate and any transaction fees before completing a currency conversion.",
    ],
    tips: [
      "Check the current exchange rate.",
      "Look for additional conversion or transfer fees.",
      "Compare more than one provider before transferring money.",
    ],
    links: [
      {
        label: "Reserve Bank of New Zealand",
        url: "https://www.rbnz.govt.nz/",
      },
    ],
    quickCheck: {
      question:
        "Two providers advertise similar exchange rates, but one charges an additional conversion fee. What should the student consider?",
      options: [
        "Only the advertised exchange rate",
        "The exchange rate and all additional fees",
        "Only the provider name",
        "Only how quickly the website loads",
      ],
      correctAnswer: 1,
      explanation:
        "The total cost can depend on both the exchange rate and additional transaction or conversion fees.",
    },
  },

  {
    id: "nz-living-costs",
    title: "Dealing With New Zealand Living Costs",
    category: "Living Costs",
    introduction:
      "Living costs in New Zealand may include accommodation, food, transport, utilities, communication, healthcare, and study-related expenses.",
    paragraphs: [
      "Living costs can vary depending on the location, type of accommodation, transport needs, and personal spending habits. Students living in a major city may experience different costs from students living in a smaller town.",
      "Students can manage living costs by planning regular expenses, comparing prices, preparing meals at home, using student discounts, and tracking spending through a budget.",
    ],
    tips: [
      "Plan for regular weekly and monthly expenses.",
      "Use student discounts where available.",
      "Keep some savings for unexpected expenses.",
    ],
    links: [
      {
        label: "Immigration New Zealand – Cost of Living",
        url: "https://www.immigration.govt.nz/live/moving-to-new-zealand/cost-of-living-in-new-zealand/",
      },
    ],
    quickCheck: {
      question:
        "A student's weekly spending is regularly higher than expected. What would be the most useful first step?",
      options: [
        "Stop checking their spending",
        "Track actual expenses and compare them with their budget",
        "Increase optional spending",
        "Ignore small purchases",
      ],
      correctAnswer: 1,
      explanation:
        "Tracking actual spending helps identify where the budget differs from real spending and where changes could be made.",
    },
  },

  {
    id: "part-time-job-tax",
    title: "Part-Time Jobs and Tax",
    category: "Income and Tax",
    introduction:
      "Students working part-time in New Zealand generally need an IRD number and the correct tax code.",
    paragraphs: [
      "Employers normally deduct tax from wages before paying employees. The tax code used may depend on whether the job is the student's main source of income or an additional source of income.",
      "Students should check their payslips and make sure that their personal information and tax code are correct. Students with more than one source of income may need to use different tax codes.",
    ],
    tips: [
      "Apply for an IRD number before beginning work.",
      "Use the correct tax code.",
      "Check your payslips and income records.",
    ],
    links: [
      {
        label: "Inland Revenue – Individuals",
        url: "https://www.ird.govt.nz/individuals",
      },
    ],
    quickCheck: {
      question:
        "A student starts a second part-time job. Which action would be most appropriate?",
      options: [
        "Assume the same tax details always apply",
        "Check whether the correct tax code is being used",
        "Stop checking payslips",
        "Ignore income records",
      ],
      correctAnswer: 1,
      explanation:
        "Students with more than one source of income may need different tax codes, so checking the correct tax code is important.",
    },
  },
];

const glossaryItems: GlossaryItem[] = [
  {
    term: "Gross Income",
    definition:
      "The total amount of income earned before tax and other deductions are taken out.",
    example:
      "If you earn $2,500 before tax is deducted, your gross income is $2,500.",
  },
  {
    term: "Net Income",
    definition:
      "The amount of income remaining after tax and other deductions have been taken out.",
    example:
      "If your gross income is $2,500 and $400 is deducted, your net income is $2,100.",
  },
  {
    term: "Fixed Expenses",
    definition:
      "Expenses that generally stay the same or are predictable over a regular period.",
    example:
      "Rent may be a fixed expense if you pay the same amount each week.",
  },
  {
    term: "Variable Expenses",
    definition:
      "Expenses that can change depending on usage, choices, or circumstances.",
    example:
      "Groceries and entertainment spending may vary from week to week.",
  },
  {
    term: "Disposable Income",
    definition:
      "Money available after required deductions and necessary expenses have been considered.",
    example:
      "Money remaining after essential costs may be available for saving or optional spending.",
  },
  {
    term: "Emergency Fund",
    definition:
      "Money set aside to help cover unexpected expenses or financial emergencies.",
    example:
      "An emergency fund could help pay for an unexpected medical or transport cost.",
  },
  {
    term: "Interest Rate",
    definition:
      "A percentage used to calculate the cost of borrowing money or the return earned on some savings.",
    example:
      "A loan with a higher interest rate will generally cost more to repay.",
  },
  {
    term: "Credit Score",
    definition:
      "A measure used by lenders to help assess a person's creditworthiness.",
    example:
      "A lender may consider credit information when deciding whether to approve a loan.",
  },
  {
    term: "Debt-to-Income Ratio",
    definition:
      "A comparison between a person's debt payments and their income.",
    example:
      "Higher debt payments compared with income may make it more difficult to manage other expenses.",
  },
  {
    term: "KiwiSaver",
    definition:
      "A New Zealand voluntary savings initiative mainly designed to help people save for retirement.",
    example:
      "Eligible employees may contribute part of their pay to KiwiSaver.",
  },
  {
    term: "Inflation",
    definition:
      "A general increase in prices over time, which can reduce the purchasing power of money.",
    example:
      "If food prices increase, the same grocery budget may buy fewer items than before.",
  },
];

export default function ResourcesPage() {
  const [searchText, setSearchText] = useState("");

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});

  const [checkedAnswers, setCheckedAnswers] = useState<
    Record<string, boolean>
  >({});

  const [openGlossaryTerm, setOpenGlossaryTerm] = useState<string | null>(null);

  const [income, setIncome] = useState(2500);
  const [rent, setRent] = useState(1000);
  const [groceries, setGroceries] = useState(400);
  const [transport, setTransport] = useState(200);
  const [entertainment, setEntertainment] = useState(300);
  const [other, setOther] = useState(150);

  const [whatIfGroceries, setWhatIfGroceries] = useState(400);
  const [whatIfTransport, setWhatIfTransport] = useState(200);
  const [whatIfEntertainment, setWhatIfEntertainment] = useState(300);
  const [whatIfOther, setWhatIfOther] = useState(150);

  const searchValue = searchText.trim().toLowerCase();

  const filteredResources = resources.filter((resource) => {
    if (searchValue === "") {
      return true;
    }

    return (
      resource.title.toLowerCase().includes(searchValue) ||
      resource.category.toLowerCase().includes(searchValue) ||
      resource.introduction.toLowerCase().includes(searchValue) ||
      resource.paragraphs.some((paragraph) =>
        paragraph.toLowerCase().includes(searchValue)
      ) ||
      resource.tips.some((tip) => tip.toLowerCase().includes(searchValue))
    );
  });

  const currentExpenses =
    rent + groceries + transport + entertainment + other;

  const currentSavings = income - currentExpenses;

  const whatIfExpenses =
    rent +
    whatIfGroceries +
    whatIfTransport +
    whatIfEntertainment +
    whatIfOther;

  const whatIfSavings = income - whatIfExpenses;

  const monthlyDifference = whatIfSavings - currentSavings;

  const yearlyDifference = monthlyDifference * 12;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const resetWhatIf = () => {
    setWhatIfGroceries(groceries);
    setWhatIfTransport(transport);
    setWhatIfEntertainment(entertainment);
    setWhatIfOther(other);
  };

  return (
    <div className="min-h-screen w-full max-w-[900px] bg-white px-8 pb-12 text-black dark:bg-black dark:text-white">
      {/* Page heading */}

      {/* Sticky navigation */}
      <div className="sticky top-0 z-40 mb-5 bg-white py-2 dark:bg-black">
        {/* Search */}
        <div className="mb-2 rounded-lg border border-zinc-200 bg-zinc-100 p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Resources"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 pr-10 text-black outline-none focus:border-blue-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
              />

              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>

            <button
              type="button"
              title="Filter functionality will be added later"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <Filter size={17} />
              Filter
            </button>
          </div>

          {searchText.trim() !== "" && (
            <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              {filteredResources.length} resource
              {filteredResources.length === 1 ? "" : "s"} found for{" "}
              <span className="font-bold">
                &quot;{searchText.trim()}&quot;
              </span>
            </p>
          )}
        </div>

        {/* Jump navigation */}
        <section className="rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-2 text-base font-semibold">Jump to</h2>

          {/* Resource links */}
          <div className="flex flex-wrap gap-2">
            {filteredResources.map((resource) => (
              <a
                key={resource.id}
                href={`#${resource.id}`}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm text-blue-600 transition hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-blue-400 dark:hover:border-blue-600 dark:hover:bg-zinc-700"
              >
                <HighlightText
                  text={resource.title}
                  highlight={searchText}
                />
              </a>
            ))}
          </div>

          {/* Explore */}
          {searchValue === "" && (
            <div className="mt-3 border-t border-zinc-300 pt-3 dark:border-zinc-700">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Explore
              </p>

              <div className="flex flex-wrap gap-2">
                <a
                  href="#what-if-planner"
                  className="rounded-full border border-blue-400 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:border-blue-600 dark:hover:bg-blue-900"
                >
                  What-If Planner
                </a>

                <a
                  href="#financial-glossary"
                  className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 transition hover:border-violet-500 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300 dark:hover:border-violet-600 dark:hover:bg-violet-900"
                >
                  Financial Glossary
                </a>
              </div>
            </div>
          )}

          {filteredResources.length === 0 && searchValue !== "" && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              No matching resource links were found.
            </p>
          )}
        </section>
      </div>

      {/* Resource articles */}
      <div className="space-y-5">
        {filteredResources.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-2 text-xl font-bold">No resources found</h2>

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Try searching with a different word or category.
            </p>
          </div>
        )}

        {filteredResources.map((resource) => {
          const originalIndex = resources.findIndex(
            (item) => item.id === resource.id
          );

          const selectedAnswer = selectedAnswers[resource.id];
          const hasChecked = checkedAnswers[resource.id];

          const isCorrect =
            selectedAnswer === resource.quickCheck.correctAnswer;

          return (
            <article
              id={resource.id}
              key={resource.id}
              className="scroll-mt-[270px] rounded-lg border border-zinc-200 bg-zinc-100 p-6 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {resource.category}
                </p>

                <h2 className="text-3xl font-bold">
                  {originalIndex + 1}.{" "}
                  <HighlightText
                    text={resource.title}
                    highlight={searchText}
                  />
                </h2>
              </div>

              <p className="mb-4 leading-7 text-zinc-700 dark:text-zinc-200">
                <HighlightText
                  text={resource.introduction}
                  highlight={searchText}
                />
              </p>

              {resource.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${resource.id}-paragraph-${paragraphIndex}`}
                  className="mb-4 leading-7 text-zinc-700 dark:text-zinc-200"
                >
                  <HighlightText
                    text={paragraph}
                    highlight={searchText}
                  />
                </p>
              ))}

              {/* Useful Tips */}
              <div className="mb-5 rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
                <h3 className="mb-2 font-bold">Useful Tips</h3>

                <ul className="list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-200">
                  {resource.tips.map((tip, tipIndex) => (
                    <li key={`${resource.id}-tip-${tipIndex}`}>
                      <HighlightText text={tip} highlight={searchText} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* External Links */}
              <div>
                <h3 className="mb-2 font-bold">External Links</h3>

                <div className="flex flex-col gap-2">
                  {resource.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Check */}
              <div className="mt-6 rounded-lg border border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    Test your understanding
                  </p>

                  <h3 className="text-xl font-bold">Quick Check</h3>
                </div>

                <p className="mb-4 leading-6">
                  {resource.quickCheck.question}
                </p>

                <div className="space-y-2">
                  {resource.quickCheck.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswer === optionIndex;

                    return (
                      <label
                        key={`${resource.id}-option-${optionIndex}`}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quick-check-${resource.id}`}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedAnswers((previous) => ({
                              ...previous,
                              [resource.id]: optionIndex,
                            }));

                            setCheckedAnswers((previous) => ({
                              ...previous,
                              [resource.id]: false,
                            }));
                          }}
                          className="h-4 w-4"
                        />

                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={selectedAnswer === undefined}
                  onClick={() =>
                    setCheckedAnswers((previous) => ({
                      ...previous,
                      [resource.id]: true,
                    }))
                  }
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Check Answer
                </button>

                {hasChecked && (
                  <div
                    className={`mt-4 rounded-lg border p-4 ${
                      isCorrect
                        ? "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                        : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    <p className="font-bold">
                      {isCorrect ? "✓ Correct!" : "Not quite. Try again."}
                    </p>

                    {isCorrect && (
                      <p className="mt-1 text-sm leading-6">
                        {resource.quickCheck.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* What-If Planner */}
      {searchValue === "" && (
        <section
          id="what-if-planner"
          className="scroll-mt-[270px] mt-8 rounded-xl border border-zinc-200 bg-zinc-100 p-6 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <TrendingUp size={24} />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                Interactive Tool
              </p>

              <h2 className="text-3xl font-bold">What-If Planner</h2>

              <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                Explore how changes to your monthly spending could affect your
                savings.
              </p>
            </div>
          </div>

          {/* Current budget */}
          <div className="mb-6 rounded-lg border border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
            <div className="mb-4 flex items-center gap-2">
              <WalletCards size={20} />
              <h3 className="text-xl font-bold">Current Monthly Budget</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MoneyInput
                label="Monthly Income"
                value={income}
                onChange={setIncome}
              />

              <MoneyInput label="Rent" value={rent} onChange={setRent} />

              <MoneyInput
                label="Groceries"
                value={groceries}
                onChange={(value) => {
                  setGroceries(value);
                  setWhatIfGroceries(value);
                }}
              />

              <MoneyInput
                label="Transport"
                value={transport}
                onChange={(value) => {
                  setTransport(value);
                  setWhatIfTransport(value);
                }}
              />

              <MoneyInput
                label="Entertainment"
                value={entertainment}
                onChange={(value) => {
                  setEntertainment(value);
                  setWhatIfEntertainment(value);
                }}
              />

              <MoneyInput
                label="Other Expenses"
                value={other}
                onChange={(value) => {
                  setOther(value);
                  setWhatIfOther(value);
                }}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total Expenses
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {formatMoney(currentExpenses)}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Current Savings
                </p>

                <p
                  className={`mt-1 text-2xl font-bold ${
                    currentSavings >= 0
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {formatMoney(currentSavings)}
                </p>
              </div>
            </div>
          </div>

          {/* What If controls */}
          <div className="mb-6 rounded-lg border border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">What if I changed...</h3>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Adjust flexible expenses to compare another scenario.
                </p>
              </div>

              <button
                type="button"
                onClick={resetWhatIf}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Reset
              </button>
            </div>

            <div className="space-y-6">
              <WhatIfSlider
                label="Groceries"
                currentValue={groceries}
                value={whatIfGroceries}
                onChange={setWhatIfGroceries}
              />

              <WhatIfSlider
                label="Transport"
                currentValue={transport}
                value={whatIfTransport}
                onChange={setWhatIfTransport}
              />

              <WhatIfSlider
                label="Entertainment"
                currentValue={entertainment}
                value={whatIfEntertainment}
                onChange={setWhatIfEntertainment}
              />

              <WhatIfSlider
                label="Other Expenses"
                currentValue={other}
                value={whatIfOther}
                onChange={setWhatIfOther}
              />
            </div>
          </div>

          {/* Result */}
          <div className="rounded-lg border border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
            <h3 className="mb-5 text-xl font-bold">Your What-If Result</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultCard
                label="Current Savings"
                value={formatMoney(currentSavings)}
              />

              <ResultCard
                label="What-If Savings"
                value={formatMoney(whatIfSavings)}
              />

              <ResultCard
                label="Monthly Difference"
                value={`${monthlyDifference > 0 ? "+" : ""}${formatMoney(
                  monthlyDifference
                )}`}
              />
            </div>

            <div
              className={`mt-5 rounded-lg border p-4 ${
                monthlyDifference > 0
                  ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : monthlyDifference < 0
                    ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                    : "border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
              }`}
            >
              {monthlyDifference > 0 && (
                <>
                  <p className="font-bold text-green-800 dark:text-green-300">
                    You could have {formatMoney(monthlyDifference)} more
                    available each month.
                  </p>

                  <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                    That is approximately {formatMoney(yearlyDifference)} over
                    12 months if the same difference continued.
                  </p>
                </>
              )}

              {monthlyDifference < 0 && (
                <>
                  <p className="font-bold text-orange-800 dark:text-orange-300">
                    This scenario leaves{" "}
                    {formatMoney(Math.abs(monthlyDifference))} less available
                    each month.
                  </p>

                  <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                    Over 12 months, the difference would be approximately{" "}
                    {formatMoney(Math.abs(yearlyDifference))}.
                  </p>
                </>
              )}

              {monthlyDifference === 0 && (
                <p className="text-zinc-700 dark:text-zinc-300">
                  Adjust one of the expenses above to explore a different
                  scenario.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Financial Glossary */}
      {searchValue === "" && (
        <section
          id="financial-glossary"
          className="scroll-mt-[270px] mt-8 rounded-xl border border-zinc-200 bg-zinc-100 p-6 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-lg bg-violet-100 p-3 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <BookOpen size={24} />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                Financial Reference
              </p>

              <h2 className="text-3xl font-bold">Financial Glossary</h2>

              <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                Select a financial term to see its meaning and a simple example.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {glossaryItems.map((item) => {
              const isOpen = openGlossaryTerm === item.term;

              return (
                <div
                  key={item.term}
                  className="overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGlossaryTerm(isOpen ? null : item.term)
                    }
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <span className="font-bold">{item.term}</span>

                    {isOpen ? (
                      <ChevronUp
                        size={19}
                        className="shrink-0 text-violet-500"
                      />
                    ) : (
                      <ChevronDown
                        size={19}
                        className="shrink-0 text-zinc-500"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-zinc-200 px-4 pb-4 pt-4 dark:border-zinc-800">
                      <div className="mb-4">
                        <p className="mb-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                          Definition
                        </p>

                        <p className="leading-6 text-zinc-700 dark:text-zinc-200">
                          {item.definition}
                        </p>
                      </div>

                      <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-950/40">
                        <p className="mb-1 text-sm font-bold text-violet-700 dark:text-violet-300">
                          Example
                        </p>

                        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          {item.example}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* Search highlight */
function HighlightText({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  const searchTerm = highlight.trim();

  if (searchTerm === "") {
    return <>{text}</>;
  }

  const escapedSearchTerm = searchTerm.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const regex = new RegExp(`(${escapedSearchTerm})`, "gi");

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch =
          part.toLowerCase() === searchTerm.toLowerCase();

        return isMatch ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-yellow-200 px-0.5 text-black dark:bg-yellow-500 dark:text-black"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </>
  );
}

type MoneyInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function MoneyInput({
  label,
  value,
  onChange,
}: MoneyInputProps) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium">{label}</span>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          $
        </span>

        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) =>
            onChange(Math.max(0, Number(event.target.value) || 0))
          }
          className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-8 pr-3 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
    </label>
  );
}

type WhatIfSliderProps = {
  label: string;
  currentValue: number;
  value: number;
  onChange: (value: number) => void;
};

function WhatIfSlider({
  label,
  currentValue,
  value,
  onChange,
}: WhatIfSliderProps) {
  const sliderMax = Math.max(currentValue * 2, 500);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{label}</p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Current: ${currentValue.toLocaleString("en-NZ")}
          </p>
        </div>

        <div className="relative w-28">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
            $
          </span>

          <input
            type="number"
            min="0"
            value={value}
            onChange={(event) =>
              onChange(Math.max(0, Number(event.target.value) || 0))
            }
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-7 pr-2 text-right text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <input
        type="range"
        min="0"
        max={sliderMax}
        step="10"
        value={Math.min(value, sliderMax)}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="w-full cursor-pointer accent-blue-600"
      />
    </div>
  );
}

type ResultCardProps = {
  label: string;
  value: string;
};

function ResultCard({
  label,
  value,
}: ResultCardProps) {
  return (
    <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}