import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Testcase, TestcaseSchema } from "./testcase.schema";

// Register enums with GraphQL
export enum LanguageEnum {
  Java = "java",
  C = "c",
  Cpp = "cpp",
}

export enum DifficultyEnum {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}


export const PredefinedTags = [
  "array",
  "string",
  "hash-table",
  "dynamic-programming",
  "math",
  "sorting",
  "greedy",
  "depth-first-search",
  "database",
  "binary-search",
  "matrix",
  "tree",
  "breadth-first-search",
  "bit-manipulation",
  "two-pointers",
  "prefix-sum",
  "heap-(priority-queue)",
  "binary-tree",
  "simulation",
  "stack",
  "graph",
  "counting",
  "sliding-window",
  "design",
  "backtracking",
  "enumeration",
  "union-find",
  "linked-list",
  "number-theory",
  "ordered-set",
  "monotonic-stack",
  "trie",
  "segment-tree",
  "bitmask",
  "queue",
  "divide-and-conquer",
  "recursion",
  "combinatorics",
  "binary-indexed-tree",
  "geometry",
  "binary-search-tree",
  "hash-function",
  "memoization",
  "string-matching",
  "topological-sort",
  "shortest-path",
  "rolling-hash",
  "game-theory",
  "interactive",
  "data-stream",
  "monotonic-queue",
  "brainteaser",
  "randomized",
  "merge-sort",
  "doubly-linked-list",
  "counting-sort",
  "iterator",
  "concurrency",
  "probability-and-statistics",
  "quickselect",
  "suffix-array",
  "bucket-sort",
];

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
  discriminatorKey: "type",
})
export class Exercise {
  @Prop({ required: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ enum: DifficultyEnum, required: true })
  difficulty: DifficultyEnum;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: [String],
    validate: {
      validator: (tags: string[]) =>
        tags.every((tag) => PredefinedTags.includes(tag)),
      message: "Tags must be one of the predefined values",
    },
  })
  tags: string[];

  @Prop({
    type: [TestcaseSchema], // Use TestCase schema as a subdocument
    required: true,
  })
  testcases: Testcase[];

  //score
  @Prop({ required: true })
  score: number;
}

export type ExerciseDocument = Exercise & Document;

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
