"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Search,
} from "lucide-react";

type ResourceLink = {
  label: string;
  url: string;
};

type QuickCheckSource = {
  label: string;
  url: string;
};

type QuickCheck = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source: QuickCheckSource;
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
  source: ResourceLink;
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
      source: {
        label: "Sorted – Planning and Budgeting",
        url: "https://sorted.org.nz/guides/planning-and-budgeting/",
      },
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
      source: {
        label: "AUT – Scholarships and Awards",
        url: "https://www.aut.ac.nz/study/fees-and-scholarships/scholarships-and-awards-at-aut",
      },
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
      source: {
        label: "StudyLink – Student Allowance",
        url: "https://www.studylink.govt.nz/products/a-z-products/student-allowance/index.html",
      },
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
      source: {
        label: "Consumer NZ – Foreign Transaction Fees",
        url: "https://www.consumer.org.nz/travel-and-transport/travel/foreign-transaction-fees",
      },
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
      source: {
        label: "Reserve Bank of New Zealand – Exchange Rates and TWI",
        url: "https://www.rbnz.govt.nz/en/statistics/series/exchange-and-interest-rates/exchange-rates-and-the-trade-weighted-index",
      },
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
      source: {
        label: "Sorted – Planning and Budgeting",
        url: "https://sorted.org.nz/guides/planning-and-budgeting/",
      },
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
      source: {
        label: "Inland Revenue – Tax Codes",
        url: "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals",
      },
    },
  },
];

const glossaryItems: GlossaryItem[] = [
  {
    term: "Gross Pay",
    definition:
      "Pay before tax and other deductions are taken out.",
    example:
      "If you earn $2,500 before tax and other deductions, your gross pay is $2,500.",
    source: {
      label: "Employment New Zealand – Payslips",
      url: "https://www.employment.govt.nz/pay-and-hours/pay-and-wages/payslips",
    },
  },
  {
    term: "Net Pay",
    definition:
      "The amount an employee is paid after all deductions have been made.",
    example:
      "If your gross pay is $2,500 and $400 is deducted, your net pay is $2,100.",
    source: {
      label: "Employment New Zealand – Payslips",
      url: "https://www.employment.govt.nz/pay-and-hours/pay-and-wages/payslips",
    },
  },
  {
    term: "Fixed Expenses",
    definition:
      "Expenses that are relatively predictable and stay the same or similar over a budgeting period.",
    example:
      "Rent may be a fixed expense if you pay the same amount each week.",
    source: {
      label: "Sorted – How the Budget Planner Works",
      url: "https://sorted.org.nz/how-these-calculators-work/",
    },
  },
  {
    term: "Variable Expenses",
    definition:
      "Expenses that can change from period to period and are often affected by day-to-day choices.",
    example:
      "Groceries and entertainment spending may vary from week to week.",
    source: {
      label: "Sorted – Crunch the Food Budget",
      url: "https://sorted.org.nz/blog/crunch-the-food-budget/",
    },
  },
  {
    term: "Disposable Income",
    definition:
      "Income remaining after income tax and compulsory levies are deducted, with eligible tax credits taken into account.",
    example:
      "Disposable income is the income available after the relevant taxes and compulsory deductions have been accounted for.",
    source: {
      label: "Stats NZ – Measuring Child Poverty: Concepts and Definitions",
      url: "https://www.stats.govt.nz/assets/Uploads/Methods/Measuring-child-poverty-concepts-and-definitions/Download/Measuring-child-poverty-concepts-and-definitions-second-edition.pdf",
    },
  },
  {
    term: "Emergency Fund",
    definition:
      "Money set aside so that unexpected and urgent expenses can be covered without relying on new debt.",
    example:
      "An emergency fund could help cover an unexpected dental bill, car repair, or loss of income.",
    source: {
      label: "Sorted – Emergency Savings",
      url: "https://sorted.org.nz/guides/saving-and-investing/how-to-build-up-your-emergency-savings/",
    },
  },
  {
    term: "Interest Rate",
    definition:
      "A percentage that affects how much interest is charged on borrowing or earned on savings.",
    example:
      "A higher loan interest rate generally makes borrowing more expensive, while a higher savings rate can increase interest earned.",
    source: {
      label: "Reserve Bank of New Zealand – The Official Cash Rate",
      url: "https://www.rbnz.govt.nz/monetary-policy/about-monetary-policy/the-official-cash-rate",
    },
  },
  {
    term: "Credit Score",
    definition:
      "A number based on a person's credit history that helps lenders assess reliability with lending.",
    example:
      "A lender may consider your credit score and credit history when deciding whether to approve credit.",
    source: {
      label: "Consumer Protection – Credit Checks, Scores and History",
      url: "https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/credit-checks-scores-and-history",
    },
  },
  {
    term: "Debt-to-Income Ratio",
    definition:
      "A comparison of a borrower's total debt with their annual gross income.",
    example:
      "If a borrower has $60,000 of total debt and $30,000 of annual gross income, their debt-to-income ratio is 2.",
    source: {
      label: "Reserve Bank of New Zealand – Understanding DTI Restrictions",
      url: "https://www.rbnz.govt.nz/education/explainers/dti",
    },
  },
  {
    term: "KiwiSaver",
    definition:
      "A voluntary work-based savings scheme set up by the New Zealand Government to help people prepare for retirement.",
    example:
      "Eligible employees can contribute part of their pay to a KiwiSaver scheme and may also receive employer and government contributions when eligible.",
    source: {
      label: "Financial Markets Authority – KiwiSaver",
      url: "https://www.fma.govt.nz/consumer/kiwisaver-and-superannuation/about-kiwisaver/",
    },
  },
  {
    term: "Inflation",
    definition:
      "An increase in the average prices of a range of goods and services, which reduces the buying power of money over time.",
    example:
      "If prices rise over time, the same amount of money may buy fewer goods and services than before.",
    source: {
      label: "Reserve Bank of New Zealand – Inflation",
      url: "https://www.rbnz.govt.nz/monetary-policy/about-monetary-policy/inflation",
    },
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


  return (
    <main className="min-h-screen bg-background px-8 py-10 text-text xl:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="mt-1 text-inactive-text">
            Explore practical financial information, helpful links, quick checks,
            and a financial glossary.
          </p>
        </div>

        {/* Search */}
        <section className="mb-5 rounded-2xl border border-zinc-800 bg-widget p-5 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Resources"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-secondary px-4 py-3 pr-11 text-text outline-none transition focus:border-blue-500"
              />

              <Search
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-inactive-text"
              />
            </div>

            <button
              type="button"
              title="Filter functionality will be added later"
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-secondary px-5 py-3 text-sm font-medium transition hover:border-zinc-500"
            >
              <Filter size={17} />
              Filter
            </button>
          </div>

          {searchText.trim() !== "" && (
            <p className="mt-3 text-sm font-medium text-blue-400">
              {filteredResources.length} resource
              {filteredResources.length === 1 ? "" : "s"} found for{" "}
              <span className="font-bold">
                &quot;{searchText.trim()}&quot;
              </span>
            </p>
          )}
        </section>

        {/* Jump navigation */}
        <section className="mb-8 rounded-2xl border border-zinc-800 bg-widget p-5 shadow-lg">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-blue-400">
            Explore
          </p>

          <h2 className="text-xl font-bold">Jump to a resource</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {filteredResources.map((resource) => (
              <a
                key={resource.id}
                href={`#${resource.id}`}
                className="rounded-full border border-zinc-700 bg-secondary px-3 py-2 text-sm font-medium text-blue-400 transition hover:border-blue-500 hover:bg-blue-500/10"
              >
                <HighlightText
                  text={resource.title}
                  highlight={searchText}
                />
              </a>
            ))}

            {searchValue === "" && (
              <a
                href="#financial-glossary"
                className="rounded-full border border-violet-700 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-300 transition hover:border-violet-500 hover:bg-violet-500/15"
              >
                Financial Glossary
              </a>
            )}
          </div>

          {filteredResources.length === 0 && searchValue !== "" && (
            <p className="mt-3 text-sm text-inactive-text">
              No matching resource links were found.
            </p>
          )}
        </section>

        {/* Resource articles */}
        <div className="space-y-6">
          {filteredResources.length === 0 && (
            <section className="rounded-2xl border border-zinc-800 bg-widget p-8 text-center shadow-lg">
              <h2 className="text-xl font-bold">No resources found</h2>
              <p className="mt-2 text-sm text-inactive-text">
                Try searching with a different word or category.
              </p>
            </section>
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
                className="scroll-mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-widget shadow-lg"
              >
                {/* Article header */}
                <div className="border-b border-zinc-800 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                    {resource.category}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {originalIndex + 1}.{" "}
                    <HighlightText
                      text={resource.title}
                      highlight={searchText}
                    />
                  </h2>

                  <p className="mt-3 leading-7 text-inactive-text">
                    <HighlightText
                      text={resource.introduction}
                      highlight={searchText}
                    />
                  </p>
                </div>

                <div className="p-6">
                  {/* Main content */}
                  <div className="space-y-4">
                    {resource.paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${resource.id}-paragraph-${paragraphIndex}`}
                        className="leading-7 text-inactive-text"
                      >
                        <HighlightText
                          text={paragraph}
                          highlight={searchText}
                        />
                      </p>
                    ))}
                  </div>

                  {/* Tips + external links */}
                  <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border border-zinc-800 bg-secondary p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                        Helpful
                      </p>
                      <h3 className="mt-1 font-bold">Useful Tips</h3>

                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-inactive-text">
                        {resource.tips.map((tip, tipIndex) => (
                          <li key={`${resource.id}-tip-${tipIndex}`}>
                            <HighlightText
                              text={tip}
                              highlight={searchText}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-xl border border-zinc-800 bg-secondary p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                        Learn More
                      </p>
                      <h3 className="mt-1 font-bold">External Links</h3>

                      <div className="mt-3 flex flex-col gap-3">
                        {resource.links.map((link) => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-fit items-center gap-2 text-sm font-medium text-blue-400 underline decoration-blue-400/40 underline-offset-4 transition hover:text-blue-300"
                          >
                            <ExternalLink size={15} />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Quick Check */}
                  <section className="mt-6 rounded-xl border border-blue-900/60 bg-blue-950/15 p-5">
                    <div className="mb-4">
                      <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                        Test your understanding
                      </p>
                      <h3 className="mt-1 text-xl font-bold">Quick Check</h3>
                    </div>

                    <p className="mb-4 leading-6">
                      {resource.quickCheck.question}
                    </p>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {resource.quickCheck.options.map(
                        (option, optionIndex) => {
                          const isSelected =
                            selectedAnswer === optionIndex;

                          return (
                            <label
                              key={`${resource.id}-option-${optionIndex}`}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                                isSelected
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-zinc-800 bg-secondary hover:border-zinc-600"
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
                                className="mt-0.5 h-4 w-4 shrink-0"
                              />

                              <span>{option}</span>
                            </label>
                          );
                        }
                      )}
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
                      className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Check Answer
                    </button>

                    {hasChecked && (
                      <>
                        <div
                          className={`mt-4 rounded-xl border p-4 ${
                            isCorrect
                              ? "border-green-800 bg-green-950/30 text-green-300"
                              : "border-red-800 bg-red-950/30 text-red-300"
                          }`}
                        >
                          <p className="font-bold">
                            {isCorrect
                              ? "✓ Correct!"
                              : "Not quite. Try again."}
                          </p>

                          {isCorrect && (
                            <p className="mt-1 text-sm leading-6">
                              {resource.quickCheck.explanation}
                            </p>
                          )}
                        </div>

                        {isCorrect && (
                          <div className="mt-3 flex items-start gap-3 rounded-xl border border-zinc-800 bg-secondary p-4 text-sm">
                            <ExternalLink
                              size={16}
                              className="mt-0.5 shrink-0 text-inactive-text"
                            />

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-inactive-text">
                                Source
                              </p>

                              <a
                                href={resource.quickCheck.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-400 underline underline-offset-4 hover:text-blue-300"
                              >
                                {resource.quickCheck.source.label}
                              </a>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                </div>
              </article>
            );
          })}
        </div>

        {/* Financial Glossary */}
        {searchValue === "" && (
          <section
            id="financial-glossary"
            className="mt-8 scroll-mt-6 overflow-hidden rounded-2xl border border-violet-900/60 bg-widget shadow-lg"
          >
            <div className="border-b border-zinc-800 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-500/10 p-3 text-violet-300">
                  <BookOpen size={24} />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                    Financial Reference
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Financial Glossary
                  </h2>

                  <p className="mt-2 text-inactive-text">
                    Select a financial term to see its meaning, a simple
                    example, and the source used.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-6">
              {glossaryItems.map((item) => {
                const isOpen = openGlossaryTerm === item.term;

                return (
                  <div
                    key={item.term}
                    className="overflow-hidden rounded-xl border border-zinc-800 bg-secondary"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGlossaryTerm(isOpen ? null : item.term)
                      }
                      className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-white/5"
                    >
                      <span className="font-bold">{item.term}</span>

                      {isOpen ? (
                        <ChevronUp
                          size={19}
                          className="shrink-0 text-violet-400"
                        />
                      ) : (
                        <ChevronDown
                          size={19}
                          className="shrink-0 text-inactive-text"
                        />
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-zinc-800 p-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-inactive-text">
                            Definition
                          </p>

                          <p className="mt-2 leading-6 text-inactive-text">
                            {item.definition}
                          </p>
                        </div>

                        <div className="mt-4 rounded-xl bg-violet-500/10 p-4">
                          <p className="text-sm font-bold text-violet-300">
                            Example
                          </p>

                          <p className="mt-1 text-sm leading-6 text-inactive-text">
                            {item.example}
                          </p>
                        </div>

                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-zinc-800 bg-background/40 p-4 text-sm">
                          <ExternalLink
                            size={16}
                            className="mt-0.5 shrink-0 text-inactive-text"
                          />

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-inactive-text">
                              Source
                            </p>

                            <a
                              href={item.source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-violet-300 underline underline-offset-4 hover:text-violet-200"
                            >
                              {item.source.label}
                            </a>
                          </div>
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
    </main>
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
            className="rounded bg-yellow-400 px-0.5 text-black"
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
