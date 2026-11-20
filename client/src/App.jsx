import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './components/Auth';
import Courses from './components/Courses';
import AiChatbot from './components/AiChatbot';

const API_BASE = 'http://localhost:5000/api';

const HUB_TOPICS = [
  {
    title: 'C++ Programming',
    icon: '⚡',
    desc: 'Pointers, Memory, OOP Basics',
    lessons: [
      {
        title: 'Hello World & I/O',
        resources: [
          { label: 'W3Schools C++ I/O', url: 'https://www.w3schools.com/cpp/cpp_user_input.asp' },
          { label: 'GeeksforGeeks C++ Basic I/O', url: 'https://www.geeksforgeeks.org/basic-input-output-c/' },
          { label: 'cppreference I/O Streams', url: 'https://en.cppreference.com/w/cpp/io' }
        ]
      },
      {
        title: 'Pointers & References',
        resources: [
          { label: 'W3Schools C++ Pointers', url: 'https://www.w3schools.com/cpp/cpp_pointers.asp' },
          { label: 'W3Schools C++ References', url: 'https://www.w3schools.com/cpp/cpp_references.asp' },
          { label: 'LearnCpp', url: 'https://www.learncpp.com/' }
        ]
      },
      {
        title: 'OOP Concepts',
        resources: [
          { label: 'W3Schools C++ OOP', url: 'https://www.w3schools.com/cpp/cpp_oop.asp' },
          { label: 'GeeksforGeeks OOP in C++', url: 'https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/' }
        ]
      }
    ]
  },
  {
    title: 'Java Core',
    icon: '☕',
    desc: 'Classes, Objects, Polymorphism',
    lessons: [
      {
        title: 'JVM & Main Method',
        resources: [
          { label: 'GeeksforGeeks JVM Architecture', url: 'https://www.geeksforgeeks.org/jvm-works-jvm-architecture/' },
          { label: 'W3Schools Java Methods', url: 'https://www.w3schools.com/java/java_methods.asp' },
          { label: 'Oracle Java Tutorial', url: 'https://docs.oracle.com/javase/tutorial/' }
        ]
      },
      {
        title: 'Inheritance & Interfaces',
        resources: [
          { label: 'W3Schools Java Inheritance', url: 'https://www.w3schools.com/java/java_inheritance.asp' },
          { label: 'W3Schools Java Interface', url: 'https://www.w3schools.com/java/java_interface.asp' }
        ]
      },
      {
        title: 'Exception Handling',
        resources: [
          { label: 'W3Schools Java Exceptions', url: 'https://www.w3schools.com/java/java_exceptions.asp' },
          { label: 'Baeldung Java Exceptions', url: 'https://www.baeldung.com/java-exceptions' }
        ]
      }
    ]
  },
  {
    title: 'MySQL Relational DB',
    icon: '🐬',
    desc: 'Queries, JOINs & Schema Design',
    lessons: [
      {
        title: 'Basic CRUD Queries',
        resources: [
          { label: 'W3Schools SQL Tutorial', url: 'https://www.w3schools.com/sql/' },
          { label: 'MySQL Official Documentation', url: 'https://dev.mysql.com/doc/' }
        ]
      },
      {
        title: 'INNER & LEFT JOINs',
        resources: [
          { label: 'W3Schools SQL JOIN', url: 'https://www.w3schools.com/sql/sql_join.asp' },
          { label: 'MySQL JOIN Syntax', url: 'https://dev.mysql.com/doc/refman/8.4/en/join.html' }
        ]
      },
      {
        title: 'Database Indexing',
        resources: [
          { label: 'MySQL Indexes Overview', url: 'https://dev.mysql.com/doc/refman/8.4/en/mysql-indexes.html' },
          { label: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/' }
        ]
      }
    ]
  }
];

const FALLBACK_QUIZ_BANK = {
  'C++ Programming': {
    'Hello World & I/O': [
      { question: 'C++-এ স্ট্যান্ডার্ড আউটপুটের জন্য কোন স্ট্রিম অবজেক্ট ব্যবহৃত হয়?', options: ['cin', 'cout', 'cerr', 'clog'], answerIndex: 1, explanation: 'std::cout দিয়ে কনসোলে আউটপুট দেখানো হয়।' },
      { question: 'cout এবং cin ব্যবহার করতে সাধারণত কোন হেডার ফাইল লাগে?', options: ['<stdio.h>', '<iostream>', '<fstream>', '<sstream>'], answerIndex: 1, explanation: 'iostream হেডারে cin ও cout সংজ্ঞায়িত থাকে।' },
      { question: 'ইনসারশন অপারেটর কোনটি?', options: ['>>', '<<', '::', '->'], answerIndex: 1, explanation: '<< অপারেটর দিয়ে ডেটা আউটপুট স্ট্রিমে পাঠানো হয়।' },
      { question: 'এক্সট্র্যাকশন অপারেটর কোনটি?', options: ['<<', '>>', '&&', '||'], answerIndex: 1, explanation: '>> অপারেটর দিয়ে ইনপুট পড়া হয়।' },
      { question: 'নতুন লাইন প্রিন্ট করতে কোনটি ব্যবহার করা যায়?', options: ['endl', 'tab', 'eof', 'break'], answerIndex: 0, explanation: 'endl নতুন লাইন দেয় এবং বাফার ফ্লাশ করে।' },
      { question: 'C++-এ main() ফাংশনের রিটার্ন টাইপ সাধারণত কী হয়?', options: ['void', 'int', 'char', 'float'], answerIndex: 1, explanation: 'স্ট্যান্ডার্ড C++-এ int main() ব্যবহৃত হয়।' },
      { question: 'std নেমস্পেস এড়াতে কী লেখা যায়?', options: ['std::cout', 'use::cout', 'namespace::cout', 'io::cout'], answerIndex: 0, explanation: 'স্কোপ রেজোলিউশন অপারেটর দিয়ে std::cout লেখা যায়।' },
      { question: 'সিঙ্গেল-লাইন কমেন্ট শুরু হয় কোন চিহ্ন দিয়ে?', options: ['/*', '//', '#', '--'], answerIndex: 1, explanation: '// দিয়ে সিঙ্গেল-লাইন কমেন্ট লেখা হয়।' },
      { question: 'মাল্টি-লাইন কমেন্ট কোনটির ভেতরে লেখা হয়?', options: ['/* ... */', '<-- ... -->', '// ... //', '""" ... """'], answerIndex: 0, explanation: '/* এবং */ এর মাঝে মাল্টি-লাইন কমেন্ট থাকে।' },
      { question: 'প্রোগ্রাম সফলভাবে শেষ হলে main() সাধারণত কী রিটার্ন করে?', options: ['-1', '0', '1', 'null'], answerIndex: 1, explanation: '0 রিটার্ন করা মানে প্রোগ্রাম নির্বিঘ্নে সম্পন্ন হয়েছে।' }
    ],
    'Pointers & References': [
      { question: 'কোন অপারেটর ভেরিয়েবলের মেমোরি অ্যাড্রেস দেয়?', options: ['*', '&', '%', '#'], answerIndex: 1, explanation: 'Address-of অপারেটর হলো &।' },
      { question: 'পয়েন্টারের মান ডিরেফারেন্স করতে কোন অপারেটর লাগে?', options: ['*', '&', '.', 'sizeof'], answerIndex: 0, explanation: '* দিয়ে পয়েন্টার যে অ্যাড্রেসে পয়েন্ট করে তার মান পাওয়া যায়।' },
      { question: 'নাল পয়েন্টার নির্দেশ করতে আধুনিক C++-এ কী ব্যবহার করা হয়?', options: ['NULL_PTR', 'nullptr', '0x00', 'none'], answerIndex: 1, explanation: 'C++11 থেকে nullptr টাইপ-সেফ নাল পয়েন্টার হিসেবে ব্যবহৃত হয়।' },
      { question: 'Reference ভেরিয়েবল কি ডিক্লেয়ারেশনের সময় ইনিশিয়ালাইজ করতে হয়?', options: ['হ্যাঁ, বাধ্যতামূলক', 'না, পরে করলেও চলে', 'শুধু অ্যারেতে', 'শুধু পয়েন্টারে'], answerIndex: 0, explanation: 'Reference সবসময় কোনো বিদ্যমান অবজেক্টের সাথে যুক্ত থাকতে হয়।' },
      { question: 'Pass-by-reference কেন ব্যবহার করা হয়?', options: ['কপি ওভারহেড কমাতে ও মূল মান বদলাতে', 'কোড বড় করতে', 'কম্পাইলার বন্ধ করতে', 'লুপ এড়াতে'], answerIndex: 0, explanation: 'বড় অবজেক্ট কপি না করে সরাসরি মডিফাই করতে reference কার্যকর।' },
      { question: 'int* p; এখানে p কী?', options: ['ইন্টিজার ভেরিয়েবল', 'ইন্টিজার পয়েন্টার', 'অ্যারে', 'ফাংশন'], answerIndex: 1, explanation: 'p একটি int টাইপের মেমোরি অ্যাড্রেস ধারণ করে।' },
      { question: 'ডাইনামিক মেমোরি রিলিজ করতে কোন কি-ওয়ার্ড ব্যবহৃত হয়?', options: ['free', 'delete', 'remove', 'clear'], answerIndex: 1, explanation: 'new দিয়ে নেওয়া মেমোরি delete দিয়ে মুক্ত করা হয়।' },
      { question: 'ডাইনামিক অ্যারে মুছতে কোনটি সঠিক?', options: ['delete arr;', 'delete[] arr;', 'free(arr);', 'remove[] arr;'], answerIndex: 1, explanation: 'অ্যারের জন্য delete[] ব্যবহার করতে হয়।' },
      { question: 'Dangling pointer কখন তৈরি হয়?', options: ['মুক্ত করা মেমোরির অ্যাড্রেস ধরে রাখলে', 'ডিক্লেয়ার না করলে', 'const লিখলে', 'int লিখলে'], answerIndex: 0, explanation: 'delete করার পরও পয়েন্টার পুরনো অ্যাড্রেস ধরে রাখলে তা dangling হয়।' },
      { question: 'const int* p কী বোঝায়?', options: ['পয়েন্টার যে মান দেখায় তা পরিবর্তনযোগ্য নয়', 'পয়েন্টার নিজেই বদলাবে না', 'দুটোই ফিক্সড', 'সিনট্যাক্স এরর'], answerIndex: 0, explanation: 'পয়েন্টেড ভ্যালু const, তবে পয়েন্টার অন্য অ্যাড্রেসে যেতে পারে।' }
    ],
    'OOP Concepts': [
      { question: 'OOP-এর চারটি প্রধান স্তম্ভের একটি কোনটি?', options: ['Encapsulation', 'Compilation', 'Parsing', 'Linking'], answerIndex: 0, explanation: 'Encapsulation, Inheritance, Polymorphism ও Abstraction হলো OOP-এর মূল ধারণা।' },
      { question: 'ডেটা ও মেথড একসাথে বাঁধার প্রক্রিয়াকে কী বলে?', options: ['Encapsulation', 'Overloading', 'Template', 'Macro'], answerIndex: 0, explanation: 'Class-এর ভেতর ডেটা ও ফাংশন গুছিয়ে রাখাই Encapsulation।' },
      { question: 'ক্লাসের ইনস্ট্যান্সকে কী বলে?', options: ['Package', 'Object', 'Header', 'Module'], answerIndex: 1, explanation: 'ক্লাস হলো ব্লুপ্রিন্ট এবং Object হলো তার বাস্তব রূপ।' },
      { question: 'একই নামের ফাংশন ভিন্ন প্যারামিটারসহ থাকলে তাকে কী বলে?', options: ['Function Overloading', 'Recursion', 'Namespace', 'Casting'], answerIndex: 0, explanation: 'একই স্কোপে ভিন্ন সিগনেচারের ফাংশন থাকাকে Overloading বলে।' },
      { question: 'বেস ক্লাসের ভার্চুয়াল ফাংশন ডিরাইভড ক্লাসে পুনরায় লিখলে কী হয়?', options: ['Overriding', 'Shadowing', 'Inlining', 'hashing'], answerIndex: 0, explanation: 'Runtime polymorphism-এ Function Overriding ব্যবহৃত হয়।' },
      { question: 'কোন অ্যাক্সেস স্পেসিফায়ার শুধু ক্লাসের ভেতর থেকেই অ্যাক্সেসযোগ্য?', options: ['public', 'private', 'extern', 'auto'], answerIndex: 1, explanation: 'private মেম্বার সরাসরি ক্লাসের বাইরে থেকে অ্যাক্সেস করা যায় না।' },
      { question: 'Constructor কখন কল হয়?', options: ['অবজেক্ট তৈরি হলে', 'প্রোগ্রাম শেষ হলে', 'লুপ চললে', 'ফাইল খুললে'], answerIndex: 0, explanation: 'নতুন অবজেক্ট ইনিশিয়ালাইজ করার সময় constructor স্বয়ংক্রিয়ভাবে চলে।' },
      { question: 'Destructor-এর নামের আগে কোন চিহ্ন থাকে?', options: ['~', '!', '@', '$'], answerIndex: 0, explanation: 'C++-এ destructor লেখা হয় ~ClassName() আকারে।' },
      { question: 'Pure virtual function কীভাবে লেখা হয়?', options: ['= 0;', '= null;', 'virtual;', 'abstract;'], answerIndex: 0, explanation: 'সিনট্যাক্স হলো virtual void fn() = 0;।' },
      { question: 'Abstract class-এর সরাসরি কী তৈরি করা যায় না?', options: ['Object', 'Pointer', 'Reference', 'Member'], answerIndex: 0, explanation: 'Abstract class-এর সরাসরি অবজেক্ট তৈরি করা যায় না।' }
    ]
  },
  'Java Core': {
    'JVM & Main Method': [
      { question: 'JVM-এর পূর্ণরূপ কী?', options: ['Java Virtual Machine', 'Java Variable Method', 'Just Virtual Mode', 'Java Verified Module'], answerIndex: 0, explanation: 'JVM বাইটকোড এক্সিকিউট করে এবং প্ল্যাটফর্ম-নির্ভরতা কমায়।' },
      { question: 'Java-তে main মেথড সাধারণত কেন static হয়?', options: ['অবজেক্ট ছাড়াই কল করার জন্য', 'মেমোরি বাঁচাতে', 'লুপ দ্রুত করতে', 'ইনহেরিট্যান্স বন্ধ করতে'], answerIndex: 0, explanation: 'প্রোগ্রাম শুরুর সময় কোনো অবজেক্ট না থাকায় JVM সরাসরি main কল করতে পারে।' },
      { question: 'Java সোর্স কোড কম্পাইল হয়ে কী তৈরি হয়?', options: ['Bytecode (.class)', 'Machine exe only', 'HTML', 'SQL'], answerIndex: 0, explanation: 'javac সোর্স কোডকে প্ল্যাটফর্ম-স্বাধীন Bytecode-এ রূপান্তর করে।' },
      { question: 'Java-তে main মেথডের স্ট্যান্ডার্ড সিগনেচার কোনটি?', options: ['public static void main(String[] args)', 'private void main()', 'static int main(String args)', 'void main()'], answerIndex: 0, explanation: 'JVM এই সিগনেচার খুঁজে প্রোগ্রাম শুরু করে।' },
      { question: 'কোনটি JVM-এর অংশ নয়?', options: ['Class Loader', 'Execution Engine', 'Runtime Data Areas', 'SQL Parser'], answerIndex: 3, explanation: 'SQL Parser ডাটাবেজের অংশ, JVM-এর নয়।' },
      { question: 'WORA-এর অর্থ কী?', options: ['Write Once, Run Anywhere', 'Write Often, Read Always', 'Web Oriented Runtime App', 'Wide Object Runtime Access'], answerIndex: 0, explanation: 'একবার লেখা Java কোড বিভিন্ন OS-এ JVM থাকলে চালানো যায়।' },
      { question: 'JIT Compiler কী করে?', options: ['হটস্পট বাইটকোডকে নেটিভ কোডে রূপান্তর করে', 'ফাইল ডিলিট করে', 'ক্লাস ডিলিট করে', 'নেটওয়ার্ক বন্ধ করে'], answerIndex: 0, explanation: 'Just-In-Time (JIT) কম্পাইলার রানটাইমে পারফরম্যান্স বাড়ায়।' },
      { question: 'Garbage Collector-এর কাজ কী?', options: ['অব্যবহৃত অবজেক্টের মেমোরি মুক্ত করা', 'ক্লাস লোড করা', 'সিনট্যাক্স চেক করা', 'প্যাকেজ বানানো'], answerIndex: 0, explanation: 'যেসব অবজেক্ট আর রেফারেন্সড নয়, GC সেগুলোর মেমোরি ফেরত নেয়।' },
      { question: 'কোন কি-ওয়ার্ড দিয়ে একটি constant ভেরিয়েবল বোঝানো যায়?', options: ['final', 'static', 'volatile', 'transient'], answerIndex: 0, explanation: 'final ভেরিয়েবলের মান একবার সেট হলে বদলানো যায় না।' },
      { question: 'Java-তে সব ক্লাসের মূল সুপারক্লাস কোনটি?', options: ['Object', 'System', 'String', 'Main'], answerIndex: 0, explanation: 'java.lang.Object সব ক্লাসের রুট সুপারক্লাস।' }
    ],
    'Inheritance & Interfaces': [
      { question: 'একটি ক্লাস অন্য ক্লাসকে ইনহেরিট করতে কোন কি-ওয়ার্ড ব্যবহৃত হয়?', options: ['extends', 'implements', 'inherits', 'derives'], answerIndex: 0, explanation: 'ক্লাস ইনহেরিটেন্সের জন্য extends কি-ওয়ার্ড লাগে।' },
      { question: 'একটি ক্লাস interface বাস্তবায়ন করতে কোন কি-ওয়ার্ড ব্যবহার করে?', options: ['implements', 'extends', 'uses', 'binds'], answerIndex: 0, explanation: 'Interface বাস্তবায়নে implements ব্যবহৃত হয়।' },
      { question: 'Java-তে ক্লাসের ক্ষেত্রে কোন ধরনের ইনহেরিট্যান্স সরাসরি অনুমোদিত নয়?', options: ['Multiple class inheritance', 'Single inheritance', 'Multilevel inheritance', 'Hierarchical inheritance'], answerIndex: 0, explanation: 'Diamond problem এড়াতে Java একাধিক সুপারক্লাস ইনহেরিট করতে দেয় না।' },
      { question: 'একটি ক্লাস কি একাধিক interface implement করতে পারে?', options: ['হ্যাঁ, পারে', 'না, পারে না', 'শুধু abstract ক্লাসে', 'শুধু main ক্লাসে'], answerIndex: 0, explanation: 'কমা দিয়ে একাধিক interface implement করা যায়।' },
      { question: 'Interface-এর ভেরিয়েবল ডিফল্টভাবে কেমন হয়?', options: ['public static final', 'private', 'protected', 'transient'], answerIndex: 0, explanation: 'Interface ফিল্ডগুলো ডিফল্টভাবে public, static এবং final।' },
      { question: 'সুপারক্লাসের কনস্ট্রাক্টর বা মেম্বার অ্যাক্সেস করতে কোন কি-ওয়ার্ড ব্যবহৃত হয়?', options: ['super', 'this', 'base', 'parent'], answerIndex: 0, explanation: 'super দিয়ে প্যারেন্ট ক্লাসের রেফারেন্স পাওয়া যায়।' },
      { question: 'কোন কি-ওয়ার্ড দিয়ে মেথড ওভাররাইডিং প্রতিরোধ করা যায়?', options: ['final', 'public', 'default', 'native'], answerIndex: 0, explanation: 'final মেথড সাবক্লাসে ওভাররাইড করা যায় না।' },
      { question: 'Java 8-এ interface-এ বডিসহ মেথড লিখতে কোন কি-ওয়ার্ড আসে?', options: ['default', 'struct', 'friend', 'operator'], answerIndex: 0, explanation: 'interface-এ default বা static মেথডের বডি থাকতে পারে।' },
      { question: 'Upcasting সাধারণত কেমন হয়?', options: ['Implicit / নিরাপদ', 'সবসময় এরর দেয়', 'শুধু অ্যারেতে হয়', 'কখনই হয় না'], answerIndex: 0, explanation: 'সাবক্লাস রেফারেন্সকে সুপারক্লাস রেফারেন্সে রাখা নিরাপদ।' },
      { question: 'Polymorphism কী সুবিধা দেয়?', options: ['একই ইন্টারফেসে ভিন্ন আচরণ', 'ফাইল কম্প্রেশন', 'ডাটাবেজ ব্যাকআপ', 'লুপ স্কিপ'], answerIndex: 0, explanation: 'একই মেথড কল ভিন্ন অবজেক্টের ক্ষেত্রে ভিন্নভাবে কাজ করতে পারে।' }
    ],
    'Exception Handling': [
      { question: 'যে কোডে exception ঘটতে পারে তা কোন ব্লকে রাখা হয়?', options: ['try', 'catch', 'finally', 'throw'], answerIndex: 0, explanation: 'সন্দেহজনক কোড try ব্লকের ভেতরে লেখা হয়।' },
      { question: 'Exception ধরতে কোন ব্লক ব্যবহৃত হয়?', options: ['catch', 'else', 'switch', 'case'], answerIndex: 0, explanation: 'try-এর পর catch ব্লক exception হ্যান্ডেল করে।' },
      { question: 'Exception হোক বা না হোক, কোন ব্লক সাধারণত চলে?', options: ['finally', 'catch', 'throw', 'import'], answerIndex: 0, explanation: 'cleanup কাজের জন্য finally ব্লক ব্যবহৃত হয়।' },
      { question: 'কোন ক্লাসটি Throwable-এর সরাসরি সাবক্লাস নয়?', options: ['Exception', 'Error', 'String', 'RuntimeException'], answerIndex: 2, explanation: 'String কোনো exception বা error ক্লাস নয়।' },
      { question: 'মেথড সিগনেচারে checked exception ঘোষণা করতে কোন কি-ওয়ার্ড লাগে?', options: ['throws', 'throw', 'catch', 'assert'], answerIndex: 0, explanation: 'মেথড ডিক্লেয়ারেশনে throws দিয়ে সম্ভাব্য exception জানানো হয়।' },
      { question: 'একটি নির্দিষ্ট exception অবজেক্ট ছুঁড়ে দিতে কোন কি-ওয়ার্ড লাগে?', options: ['throw', 'throws', 'finally', 'return'], answerIndex: 0, explanation: 'throw new Exception(...) দিয়ে exception ছোঁড়া হয়।' },
      { question: 'ArithmeticException সাধারণত কখন ঘটে?', options: ['শূন্য দিয়ে ভাগ করলে', 'ফাইল না পেলে', 'অ্যারে আউট অব বাউন্ড হলে', 'নাল কল করলে'], answerIndex: 0, explanation: 'ইন্টিজারকে 0 দিয়ে ভাগ করলে ArithmeticException হয়।' },
      { question: 'ArrayIndexOutOfBoundsException কখন হয়?', options: ['অবৈধ ইনডেক্সে অ্যাক্সেস করলে', 'মেমোরি পূর্ণ হলে', 'ক্লাস না পেলে', 'টাইপ মিললে'], answerIndex: 0, explanation: 'অ্যারের সাইজের বাইরে ইনডেক্স ব্যবহার করলে এটি ঘটে।' },
      { question: 'NullPointerException কখন হয়?', options: ['null রেফারেন্সের মেম্বার/মেথড ব্যবহার করলে', 'লুপ শেষ হলে', 'int লিখলে', 'import ভুল হলে'], answerIndex: 0, explanation: 'null অবজেক্টের ওপর অপারেশন করলে NullPointerException আসে।' },
      { question: 'Checked exception কোথায় চেক করা হয়?', options: ['Compile time-এ', 'শুধু ডাটাবেজে', 'ব্রাউজারে', 'নেটওয়ার্কে'], answerIndex: 0, explanation: 'Checked exception কম্পাইলেশনের সময়ই ধরা পড়ে।' }
    ]
  },
  'MySQL Relational DB': {
    'Basic CRUD Queries': [
      { question: 'CRUD-এর পূর্ণরূপ কী?', options: ['Create, Read, Update, Delete', 'Copy, Run, Undo, Drop', 'Connect, Read, Upload, Delete', 'Create, Remove, Use, Dump'], answerIndex: 0, explanation: 'CRUD হলো ডাটাবেজের চারটি মৌলিক অপারেশন।' },
      { question: 'ডাটাবেজ থেকে ডেটা পড়তে কোন SQL কমান্ড ব্যবহৃত হয়?', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], answerIndex: 0, explanation: 'SELECT দিয়ে টেবিল থেকে রো/কলাম পড়া হয়।' },
      { question: 'নতুন রেকর্ড যুক্ত করতে কোন স্টেটমেন্ট লাগে?', options: ['INSERT INTO', 'SELECT FROM', 'DROP TABLE', 'ALTER INDEX'], answerIndex: 0, explanation: 'INSERT INTO দিয়ে টেবিলে নতুন ডেটা ঢোকানো হয়।' },
      { question: 'বিদ্যমান ডেটা পরিবর্তন করতে কোন কমান্ড ব্যবহৃত হয়?', options: ['UPDATE', 'SELECT', 'CREATE', 'DESCRIBE'], answerIndex: 0, explanation: 'UPDATE ... SET ... WHERE দিয়ে ডেটা আপডেট করা হয়।' },
      { question: 'টেবিল থেকে নির্দিষ্ট রেকর্ড মুছতে কোনটি ব্যবহৃত হয়?', options: ['DELETE FROM', 'DROP DATABASE', 'TRUNCATE COLUMN', 'RENAME ROW'], answerIndex: 0, explanation: 'DELETE FROM table_name WHERE ... দিয়ে রেকর্ড ডিলিট হয়।' },
      { question: 'কোন ক্লজ ছাড়া UPDATE বা DELETE চালালে কী ঝুঁকি থাকে?', options: ['সব রো প্রভাবিত হতে পারে', 'ডাটাবেজ ইনস্টল হয়', 'কলাম ডিলিট হয়', 'কোনো প্রভাব পড়ে না'], answerIndex: 0, explanation: 'WHERE না দিলে টেবিলের সব সারিতে অপারেশন ঘটে।' },
      { question: 'টেবিলের সব কলাম নির্বাচন করতে কোন চিহ্ন লাগে?', options: ['*', '#', '@', '&'], answerIndex: 0, explanation: 'SELECT * FROM users সব কলাম রিটার্ন করে।' },
      { question: 'ফলাফল সাজাতে কোন ক্লজ ব্যবহৃত হয়?', options: ['ORDER BY', 'GROUP BY', 'HAVING', 'DISTINCT'], answerIndex: 0, explanation: 'ORDER BY ASC বা DESC দিয়ে ডেটা সাজানো যায়।' },
      { question: 'ডুপ্লিকেট মান বাদ দিতে কোন কি-ওয়ার্ড লাগে?', options: ['DISTINCT', 'UNIQUE_ROW', 'SINGLE', 'ONLY'], answerIndex: 0, explanation: 'SELECT DISTINCT কলামের স্বতন্ত্র মান দেয়।' },
      { question: 'শর্ত জুড়ে দিতে কোন ক্লজ ব্যবহার করা হয়?', options: ['WHERE', 'INTO', 'VALUES', 'SET'], answerIndex: 0, explanation: 'WHERE শর্ত অনুযায়ী রেকর্ড ফিল্টার করে।' }
    ],
    'INNER & LEFT JOINs': [
      { question: 'INNER JOIN কী ধরনের রো রিটার্ন করে?', options: ['উভয় টেবিলে ম্যাচ করা রো', 'শুধু বাম টেবিলের সব রো', 'শুধু ডান টেবিলের সব রো', 'কোনো রো নয়'], answerIndex: 0, explanation: 'INNER JOIN শুধু জয়েন শর্ত মিলে যাওয়া রো দেখায়।' },
      { question: 'LEFT JOIN কী করে?', options: ['বাম টেবিলের সব রো ও ডানের ম্যাচিং ডেটা দেয়', 'শুধু ডান টেবিল দেয়', 'টেবিল ডিলিট করে', 'ইনডেক্স মুছে ফেলে'], answerIndex: 0, explanation: 'বাম টেবিলে ম্যাচ না থাকলে ডানের কলামগুলো NULL আসে।' },
      { question: 'জয়েন শর্ত লিখতে সাধারণত কোন কি-ওয়ার্ড ব্যবহৃত হয়?', options: ['ON', 'WHERE_JOIN', 'BY', 'AT'], answerIndex: 0, explanation: 'JOIN ... ON t1.id = t2.user_id এভাবে শর্ত দেওয়া হয়।' },
      { question: 'LEFT JOIN-এ ডান টেবিলে মিল না পেলে কী মান আসে?', options: ['NULL', '0000', 'ERROR', 'TRUE'], answerIndex: 0, explanation: 'অমিল কলামের জায়গায় NULL বসে।' },
      { question: 'টেবিলের সংক্ষিপ্ত নাম বা alias কীভাবে দেওয়া যায়?', options: ['FROM orders o', 'AS_ALIAS orders o', 'ALIAS o', 'NAME o'], answerIndex: 0, explanation: 'FROM orders o বা FROM orders AS o লেখা যায়।' },
      { question: 'দুটি টেবিলের কলামের নাম এক হলে কীভাবে আলাদা করা হয়?', options: ['table.column', 'table->column', 'table::column', 'table#column'], answerIndex: 0, explanation: 'ডট (.) নোটেশন দিয়ে টেবিলের কলাম নির্দিষ্ট করা হয়।' },
      { question: 'কোন জয়েনে ম্যাচ না পাওয়া বাম রোও তালিকায় থাকে?', options: ['LEFT JOIN', 'INNER JOIN', 'CROSS JOIN', 'NATURAL JOIN'], answerIndex: 0, explanation: 'LEFT JOIN বাম টেবিলের সব রো সংরক্ষণ করে।' },
      { question: 'একই টেবিলকে নিজের সাথে জয়েন করলে কী বলে?', options: ['Self Join', 'Outer Join', 'Union Join', 'Cross Join'], answerIndex: 0, explanation: 'ভিন্ন alias ব্যবহার করে একই টেবিল জয়েন করাকে Self Join বলে।' },
      { question: 'ON শর্ত ছাড়া JOIN লিখলে কী হতে পারে?', options: ['Syntax error বা Cartesian product', 'ডেটা এনক্রিপ্ট হয়', 'ইনডেক্স তৈরি হয়', 'কুইজ শুরু হয়'], answerIndex: 0, explanation: 'MySQL-এ INNER/LEFT JOIN-এ ON বা USING আবশ্যক।' },
      { question: 'LEFT JOIN দিয়ে কোন রেকর্ডগুলোর ম্যাচ নেই তা বের করতে কোন শর্ত লাগে?', options: ['WHERE right_table.id IS NULL', 'WHERE right_table.id = 0', 'WHERE left_table.id IS NULL', 'ORDER BY NULL'], answerIndex: 0, explanation: 'ডান টেবিলের key IS NULL হলে অমিল রো পাওয়া যায়।' }
    ],
    'Database Indexing': [
      { question: 'Database Index-এর প্রধান কাজ কী?', options: ['ডেটা দ্রুত খুঁজে বের করা', 'ডেটা এনক্রিপ্ট করা', 'ব্যাকআপ নেওয়া', 'কানেকশন বন্ধ করা'], answerIndex: 0, explanation: 'Index সার্চ স্পিড বাড়ায় এবং ফুল-টেবিল স্ক্যান কমায়।' },
      { question: 'MySQL InnoDB-তে প্রাইমারি কি সাধারণত কোন স্ট্রাকচারে থাকে?', options: ['Clustered B+ Tree', 'Linked List', 'Stack', 'Queue'], answerIndex: 0, explanation: 'InnoDB-তে Primary Key হলো Clustered Index (B+ Tree)।' },
      { question: 'নতুন ইনডেক্স তৈরি করতে কোন কমান্ড ব্যবহৃত হয়?', options: ['CREATE INDEX', 'MAKE SEARCH', 'ADD CACHE', 'BUILD VIEW'], answerIndex: 0, explanation: 'CREATE INDEX idx_name ON table(col) দিয়ে ইনডেক্স বানানো হয়।' },
      { question: 'ইনডেক্স বেশি থাকলে কোন অপারেশনে কিছুটা খরচ/সময় বাড়তে পারে?', options: ['INSERT, UPDATE, DELETE', 'শুধু SELECT', 'শুধু USE', 'শুধু SHOW'], answerIndex: 0, explanation: 'ডেটা বদলালে সংশ্লিষ্ট ইনডেক্সও আপডেট করতে হয়।' },
      { question: 'কোয়েরি কীভাবে ইনডেক্স ব্যবহার করছে তা দেখতে কোন কমান্ড লাগে?', options: ['EXPLAIN', 'REPAIR', 'FLUSH', 'GRANT'], answerIndex: 0, explanation: 'EXPLAIN SELECT ... দিয়ে execution plan ও key ব্যবহার দেখা যায়।' },
      { question: 'Composite index (col1, col2)-এ কোন নিয়মটি গুরুত্বপূর্ণ?', options: ['Leftmost prefix rule', 'Rightmost suffix rule', 'Random order rule', 'No order rule'], answerIndex: 0, explanation: 'বাম দিকের কলাম থেকে শুরু করে শর্ত মিললে ইনডেক্স সবচেয়ে ভালো কাজ করে।' },
      { question: 'ইনডেক্সড কলামের ওপর সরাসরি ফাংশন চালালে কী হতে পারে?', options: ['ইনডেক্স ব্যবহার নাও হতে পারে', 'কোয়েরি ক্র্যাশ করে', 'টেবিল ডিলিট হয়', 'ডেটা লক হয়'], answerIndex: 0, explanation: 'যেমন WHERE YEAR(created_at) = 2026 অনেক সময় ইনডেক্স এড়িয়ে যায়।' },
      { question: 'Covering Index কী?', options: ['যে ইনডেক্স কোয়েরির প্রয়োজনীয় সব কলাম ধারণ করে', 'যে ইনডেক্স টেবিল মুছে ফেলে', 'শুধু টেক্সট ফাইল', 'ব্যাকআপ টেবিল'], answerIndex: 0, explanation: 'Covering index হলে টেবিলের মূল রো না খুলেও উত্তর পাওয়া যায়।' },
      { question: 'UNIQUE ইনডেক্স কী নিশ্চিত করে?', options: ['কলাম বা কলামসমূহে ডুপ্লিকেট মান থাকে না', 'সব মান NULL হয়', 'টেবিল রিড-অনলি হয়', 'কানেকশন দ্রুত হয়'], answerIndex: 0, explanation: 'UNIQUE constraint ডুপ্লিকেট এন্ট্রি আটকায়।' },
      { question: 'ইনডেক্স মুছে ফেলতে কোন কমান্ড ব্যবহৃত হয়?', options: ['DROP INDEX ... ON ...', 'REMOVE KEY', 'DELETE INDEX', 'CLEAR TREE'], answerIndex: 0, explanation: 'ALTER TABLE t DROP INDEX idx_name বা DROP INDEX idx_name ON t ব্যবহৃত হয়।' }
    ]
  }
};

const buildFallbackQuizQuestions = (courseTitle, lessonTitle, count = 10, avoidList = []) => {
  const bank =
    FALLBACK_QUIZ_BANK[courseTitle]?.[lessonTitle] ||
    Object.values(FALLBACK_QUIZ_BANK).flatMap((lessonMap) => Object.values(lessonMap).flat());

  const avoidSet = new Set(avoidList);
  const unseen = bank.filter((q) => !avoidSet.has(q.question));
  const pool = unseen.length >= count ? unseen : [...unseen, ...bank.filter((q) => avoidSet.has(q.question))];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((item, idx) => ({
    id: `fallback-${Date.now()}-${idx}`,
    question: item.question,
    options: item.options,
    answerIndex: item.answerIndex,
    explanation: item.explanation
  }));
};

const HMI_STYLES = `
.hmi-root {
  --bg: #05070f;
  --glass: rgba(255, 255, 255, 0.055);
  --glass-strong: rgba(255, 255, 255, 0.09);
  --stroke: rgba(255, 255, 255, 0.12);
  --text: #e8ecf8;
  --muted: #8b93ad;
  --cyan: #22d3ee;
  --indigo: #6366f1;
  --pink: #f472b6;
  --warn: #fb923c;

  position: relative;
  min-height: 640px;
  padding: 24px;
  margin-bottom: 28px;
  overflow: hidden;
  border-radius: 24px;
  background: radial-gradient(1200px 700px at 50% 0%, #0d1224 0%, var(--bg) 70%);
  color: var(--text);
  font-family: Inter, "SF Pro Display", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.hmi-root *,
.hmi-root *::before,
.hmi-root *::after {
  box-sizing: border-box;
}
.hmi-root button {
  font-family: inherit;
  color: inherit;
}

.hmi-bg-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
  pointer-events: none;
}
.hmi-bg-glow {
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.35;
  pointer-events: none;
  animation: hmi-float 12s ease-in-out infinite alternate;
}
.hmi-bg-glow.a { background: var(--indigo); top: -140px; left: -80px; }
.hmi-bg-glow.b { background: var(--cyan); bottom: -180px; right: -100px; animation-delay: -6s; }
@keyframes hmi-float {
  to { transform: translate3d(40px, 30px, 0) scale(1.12); }
}

.hmi-scene {
  position: relative;
  perspective: 1400px;
  perspective-origin: 50% 40%;
}
.hmi-console {
  --sx: 12deg;
  --sy: 0deg;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transform-style: preserve-3d;
  transform: rotateX(var(--sx)) rotateY(var(--sy));
  transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  will-change: transform;
}

.hmi-glass {
  background: linear-gradient(145deg, var(--glass-strong), var(--glass));
  border: 1px solid var(--stroke);
  border-radius: 22px;
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.hmi-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 22px;
  border-radius: 999px;
  font-size: 14px;
  transform: translateZ(40px);
  gap: 10px;
  flex-wrap: wrap;
}
.hmi-time { font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: 0.04em; }
.hmi-top-center { display: inline-flex; gap: 6px; align-items: center; color: var(--cyan); font-size: 13px; font-weight: 600; }
.hmi-top-right { display: inline-flex; gap: 10px; align-items: center; color: var(--muted); font-size: 13px; }

.hmi-main {
  display: grid;
  grid-template-columns: minmax(210px, 1fr) minmax(320px, 1.45fr) minmax(210px, 1fr);
  gap: 18px;
  align-items: stretch;
  transform-style: preserve-3d;
}
.hmi-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hmi-panel-left { transform: translateZ(20px) rotateY(8deg); transform-origin: right center; }
.hmi-panel-right { transform: translateZ(20px) rotateY(-8deg); transform-origin: left center; }
.hmi-panel-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.hmi-bar-head { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
.hmi-bar-head b { color: var(--text); font-weight: 600; font-variant-numeric: tabular-nums; }
.hmi-bar-head i { font-style: normal; color: var(--muted); font-weight: 400; }
.hmi-bar-track { height: 6px; border-radius: 99px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.hmi-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--cyan), var(--indigo));
  transition: width 0.25s linear;
}
.hmi-bar-fill.warn { background: linear-gradient(90deg, var(--warn), var(--pink)); }

.hmi-tires { margin-top: auto; }
.hmi-tires-title { display: block; font-size: 11px; color: var(--muted); margin-bottom: 8px; letter-spacing: 0.06em; }
.hmi-car-top { position: relative; height: 112px; width: 100%; }
.hmi-car-body {
  position: absolute; left: 50%; top: 6px; bottom: 6px; width: 46px; transform: translateX(-50%);
  border-radius: 22px; border: 1px solid var(--stroke);
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.18), rgba(99, 102, 241, 0.08));
}
.hmi-tire {
  position: absolute; z-index: 1; padding: 3px 9px; font-size: 11px; font-weight: 700;
  border-radius: 8px; background: rgba(34, 211, 238, 0.12); border: 1px solid rgba(34, 211, 238, 0.35); color: var(--cyan);
}
.hmi-tire.fl { left: 4%; top: 4px; }
.hmi-tire.fr { right: 4%; top: 4px; }
.hmi-tire.rl { left: 4%; bottom: 4px; }
.hmi-tire.rr { right: 4%; bottom: 4px; }

.hmi-status-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.hmi-status-list li { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); padding-bottom: 10px; border-bottom: 1px dashed rgba(255, 255, 255, 0.08); }
.hmi-status-list b { color: var(--text); font-weight: 600; }
.hmi-next-turn {
  display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 16px;
  background: rgba(99, 102, 241, 0.14); border: 1px solid rgba(99, 102, 241, 0.35); cursor: pointer;
}
.hmi-turn-arrow { font-size: 26px; line-height: 1; color: var(--cyan); }
.hmi-next-turn strong { display: block; font-size: 16px; }
.hmi-next-turn span { font-size: 12px; color: var(--muted); }
.hmi-now-playing {
  margin-top: auto; display: flex; gap: 8px; align-items: center; font-size: 12px; color: var(--muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.hmi-cluster {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transform: translateZ(65px);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.55), 0 0 60px rgba(99, 102, 241, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.14);
}
.hmi-gauge { position: relative; width: min(100%, 320px); aspect-ratio: 1; }
.hmi-gauge-svg { width: 100%; height: 100%; overflow: visible; }
.hmi-arc-track { fill: none; stroke: rgba(255, 255, 255, 0.08); stroke-width: 10; stroke-linecap: round; }
.hmi-arc-value { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dasharray 0.25s ease; }
.hmi-needle { transform-origin: 150px 150px; transition: transform 0.25s ease; }
.hmi-needle line { stroke: var(--pink); stroke-width: 2.5; stroke-linecap: round; filter: drop-shadow(0 0 6px var(--pink)); }
.hmi-needle circle { fill: #0b0f1c; stroke: var(--pink); stroke-width: 2; }

.hmi-gauge-readout {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding-top: 36px; pointer-events: none; text-align: center;
}
.hmi-speed { font-size: 46px; font-weight: 700; line-height: 1.05; font-variant-numeric: tabular-nums; text-shadow: 0 0 30px rgba(99, 102, 241, 0.7); }
.hmi-unit { color: var(--muted); font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 6px; }
.hmi-gear-row { display: flex; gap: 10px; margin-top: 12px; pointer-events: auto; }
.hmi-gear { font-size: 12px; font-weight: 700; color: rgba(255, 255, 255, 0.35); cursor: pointer; background: transparent; border: 0; padding: 2px 4px; transition: color 0.2s, text-shadow 0.2s; }
.hmi-gear.active { color: var(--cyan); text-shadow: 0 0 12px var(--cyan); }
.hmi-mode-chip {
  margin-top: 10px; padding: 4px 12px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  border-radius: 99px; border: 1px solid var(--stroke); color: var(--muted); background: rgba(255, 255, 255, 0.04);
}

.hmi-battery { position: absolute; right: 16px; bottom: 16px; width: 78px; height: 78px; }
.hmi-battery svg { width: 100%; height: 100%; }
.hmi-ring-track { fill: none; stroke: rgba(255, 255, 255, 0.09); stroke-width: 8; }
.hmi-ring-value { fill: none; stroke: var(--cyan); stroke-width: 8; stroke-linecap: round; filter: drop-shadow(0 0 6px var(--cyan)); transition: stroke-dasharray 0.4s ease; }
.hmi-battery-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.15; }
.hmi-battery-text strong { font-size: 14px; }
.hmi-battery-text span { font-size: 10px; color: var(--muted); }

.hmi-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  padding: 16px;
  transform: translateZ(48px);
  transform-style: preserve-3d;
}
.hmi-card {
  --rx: 0deg;
  --ry: 0deg;
  --gx: 50%;
  --gy: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  min-height: 106px;
  text-align: left;
  cursor: pointer;
  border-radius: 18px;
  border: 1px solid var(--stroke);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025));
  overflow: hidden;
  transform: perspective(700px) rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0);
  transition: transform 0.18s ease-out, border-color 0.25s, box-shadow 0.25s;
}
.hmi-card:hover,
.hmi-card:focus-visible {
  border-color: rgba(34, 211, 238, 0.55);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), 0 0 24px rgba(34, 211, 238, 0.2);
  outline: none;
}
.hmi-card.is-active { border-color: var(--cyan); box-shadow: 0 0 28px rgba(34, 211, 238, 0.35); }
.hmi-card-shine {
  position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 0.25s;
  background: radial-gradient(180px circle at var(--gx) var(--gy), rgba(255, 255, 255, 0.18), transparent 60%);
}
.hmi-card:hover .hmi-card-shine { opacity: 1; }
.hmi-card-icon { font-size: 18px; margin-bottom: 4px; filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.45)); }
.hmi-card-label { font-size: 14px; font-weight: 600; }
.hmi-card-summary { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

.hmi-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(3, 5, 12, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  perspective: 1200px;
}
.hmi-modal {
  width: min(460px, 100%);
  max-height: 100%;
  overflow: auto;
  padding: 22px;
  background: linear-gradient(145deg, rgba(24, 30, 54, 0.95), rgba(12, 16, 32, 0.95));
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7), 0 0 50px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.hmi-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.hmi-modal-title { display: flex; align-items: center; gap: 10px; color: var(--cyan); }
.hmi-modal-title h2 { margin: 0; font-size: 18px; color: var(--text); }
.hmi-close {
  width: 36px; height: 36px; display: grid; place-items: center; cursor: pointer;
  border-radius: 50%; border: 1px solid var(--stroke); background: rgba(255, 255, 255, 0.05);
}
.hmi-modal-body { display: grid; gap: 14px; }
.hmi-hint { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.5; }
.hmi-action-btn {
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid rgba(34, 211, 238, 0.45);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(34, 211, 238, 0.25));
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

@media (max-width: 960px) {
  .hmi-main { grid-template-columns: 1fr; }
  .hmi-panel-left, .hmi-panel-right { transform: none; }
  .hmi-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .hmi-root { padding: 14px; }
  .hmi-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`;

const DEFAULT_MESS_WEEKLY_MENU = [
  { dayIndex: 0, day: 'শনি', morning: 'ডিম ভুনা + সবজি', night: 'মাছ + ভাজি' },
  { dayIndex: 1, day: 'রবি', morning: 'মুরগি + শাঁক', night: 'ডিম ভুনা + ডাল' },
  { dayIndex: 2, day: 'সোম', morning: 'মাছ + ভাজি', night: 'মুরগি + শাঁক' },
  { dayIndex: 3, day: 'মঙ্গল', morning: 'ডিম ভুনা + সবজি', night: 'খিচুড়ি + সালাদ + মুরগি মাংস' },
  { dayIndex: 4, day: 'বুধ', morning: 'মাছ + ভাজি', night: 'ডিম ভাজা + ডাল' },
  { dayIndex: 5, day: 'বৃহঃ', morning: 'মুরগি + ভাজি', night: 'মাছ + ভর্তা' },
  { dayIndex: 6, day: 'শুক্র', morning: 'ডিম ভুনা + ডাল', night: 'মুরগি + ভাজি' }
];

const DEFAULT_MESS_RULES = [
  'কেউ যদি কোনো মেনু পরিবর্তন করে রান্না করতে বলে তাহলে ৫ জন সদস্যের অনুমতি নিয়ে রান্না করতে হবে, অন্যথায় ওই বাজার লিস্টে যুক্ত হবে না।',
  'নিজ দায়িত্বে কী কী বাজার আছে এবং কী কী বাজার প্রয়োজন, তা দেখে বাজার করতে হবে। সাথে সাথে লিস্ট গ্রুপে আপলোড করতে হবে।',
  'কেউ মাসে ৩ দিনের বেশি ডিম ভাজি বা নুডলস রান্না করতে পারবে না।'
];

const DEFAULT_MESS_MEMBERS = [
  { id: 1, slot: 1, name: 'সদস্য ১', extraDeposit: 0, extraAddOn: 0, extraNote: '' },
  { id: 2, slot: 2, name: 'সদস্য ২', extraDeposit: 0, extraAddOn: 0, extraNote: '' },
  { id: 3, slot: 3, name: 'সদস্য ৩', extraDeposit: 0, extraAddOn: 0, extraNote: '' },
  { id: 4, slot: 4, name: 'সদস্য ৪', extraDeposit: 0, extraAddOn: 0, extraNote: '' },
  { id: 5, slot: 5, name: 'সদস্য ৫', extraDeposit: 0, extraAddOn: 0, extraNote: '' }
];

const DEFAULT_MESS_PHASES = [
  { id: 1, phaseNumber: 1, phaseLabel: 'ধাপ ১', dateRange: '১ - ৭ তারিখ', memberId: 1, amount: 0, note: '', dateEntries: [{ id: 101, date: '', amount: 0, note: '' }] },
  { id: 2, phaseNumber: 2, phaseLabel: 'ধাপ ২', dateRange: '৭ - ১৪ তারিখ', memberId: 2, amount: 0, note: '', dateEntries: [{ id: 201, date: '', amount: 0, note: '' }] },
  { id: 3, phaseNumber: 3, phaseLabel: 'ধাপ ৩', dateRange: '১৪ - ২১ তারিখ', memberId: 3, amount: 0, note: '', dateEntries: [{ id: 301, date: '', amount: 0, note: '' }] },
  { id: 4, phaseNumber: 4, phaseLabel: 'ধাপ ৪', dateRange: '২১ - ২৮ তারিখ', memberId: 4, amount: 0, note: '', dateEntries: [{ id: 401, date: '', amount: 0, note: '' }] },
  { id: 5, phaseNumber: 5, phaseLabel: 'ধাপ ৫', dateRange: '২৮ - ৩৫ তারিখ', memberId: 5, amount: 0, note: '', dateEntries: [{ id: 501, date: '', amount: 0, note: '' }] }
];

const DEFAULT_MESS_BILLS = [
  { id: 1, name: 'বাসা খরচ (ভাড়া)', amount: 0 },
  { id: 2, name: 'বুয়া বিল', amount: 0 },
  { id: 3, name: 'ওয়াইফাই বিল', amount: 0 },
  { id: 4, name: 'বিদ্যুৎ বিল', amount: 0 },
  { id: 5, name: 'গ্যাস বিল', amount: 0 }
];

const BANGLA_WEEKDAYS_BY_JS_DAY = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

const formatIsoDate = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseIsoDateSafe = (isoStr) => {
  if (!isoStr || typeof isoStr !== 'string') return null;
  const cleaned = isoStr.trim();
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(cleaned);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dt = new Date(year, month - 1, day);
  if (
    Number.isNaN(dt.getTime()) ||
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return null;
  }
  return dt;
};

const getBanglaWeekdayFromIso = (isoStr, fallbackDay) => {
  const dt = parseIsoDateSafe(isoStr);
  if (!dt) return fallbackDay || 'শনি';
  return BANGLA_WEEKDAYS_BY_JS_DAY[dt.getDay()] || fallbackDay || 'শনি';
};

const syncSheetWithCalendar = (sheetRows, startIsoDate, menuList = DEFAULT_MESS_WEEKLY_MENU) => {
  const baseDate = parseIsoDateSafe(startIsoDate) || new Date();
  return Array.from({ length: 35 }, (_, idx) => {
    const existingRow = Array.isArray(sheetRows) && sheetRows[idx] ? sheetRows[idx] : null;
    const dayNumber = idx + 1;
    const rowDateObj = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + idx);
    const isoDate = formatIsoDate(rowDateObj);
    const weekday = getBanglaWeekdayFromIso(isoDate, menuList[idx % 7]?.day);
    const matchedMenu =
      menuList.find((m) => m.day === weekday) ||
      menuList[idx % 7] ||
      DEFAULT_MESS_WEEKLY_MENU[idx % 7];

    return {
      day: dayNumber,
      calendarDate: isoDate,
      weekday,
      morningMenu: matchedMenu.morning,
      nightMenu: matchedMenu.night,
      mealsByMember: existingRow?.mealsByMember || {}
    };
  });
};

const buildDefault35DaySheet = (members, menuList = DEFAULT_MESS_WEEKLY_MENU, startIsoDate = formatIsoDate(new Date())) => {
  const baseRows = syncSheetWithCalendar([], startIsoDate, menuList);
  return baseRows.map((row) => {
    const mealsByMember = {};
    members.forEach((m) => {
      mealsByMember[m.id] = 0;
    });
    return {
      ...row,
      mealsByMember
    };
  });
};

function App() {
  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // User-Specific Storage Keys Implementation (synced with user state)
  const userEmailKey = user?.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
  const STORAGE_KEY_CGPA = `user_cgpa_${userEmailKey}`;
  const STORAGE_KEY_TRANSACTIONS = `user_transactions_${userEmailKey}`;
  const STORAGE_KEY_BUDGET = `user_budget_${userEmailKey}`;
  const STORAGE_KEY_MESS = `user_mess_state_${userEmailKey}`;

  // App & Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [coursesCount, setCoursesCount] = useState(0);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Expense State & Dynamic User-Specific Storage Integration
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });
  const [txnForm, setTxnForm] = useState({ type: 'expense', category: 'Food', amount: '', note: '' });

  // User-specific Monthly Budget & Manual Balance State
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
    return saved ? JSON.parse(saved) : { budget: 10000, initialBalance: 0 };
  });

  // CGPA Planner State & Dynamic User-Specific Storage Integration
  const [cgpaData, setCgpaData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CGPA);
    return saved ? JSON.parse(saved) : { cgpa: '3.17', totalCredits: '90' };
  });

  const [targetCgpa, setTargetCgpa] = useState('');
  const [nextCredits, setNextCredits] = useState('');
  const [requiredGpa, setRequiredGpa] = useState(null);

  // Learning Hub Active Lesson & Dynamic Quiz State
  const [activeLesson, setActiveLesson] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [quizSourceNote, setQuizSourceNote] = useState('');
  const [seenQuestions, setSeenQuestions] = useState([]);

  // House & Bills (Mess Management) State
  const [messStartDate, setMessStartDate] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_MESS) || 'null');
      return saved?.startDate || formatIsoDate(new Date());
    } catch {
      return formatIsoDate(new Date());
    }
  });
  const [messMembers, setMessMembers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_MESS) || 'null');
      return Array.isArray(saved?.members) && saved.members.length > 0 ? saved.members : DEFAULT_MESS_MEMBERS;
    } catch {
      return DEFAULT_MESS_MEMBERS;
    }
  });
  const [messWeeklyMenu, setMessWeeklyMenu] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_MESS) || 'null');
      return Array.isArray(saved?.weeklyMenu) && saved.weeklyMenu.length > 0 ? saved.weeklyMenu : DEFAULT_MESS_WEEKLY_MENU;
    } catch {
      return DEFAULT_MESS_WEEKLY_MENU;
    }
  });
  const [messRules] = useState(DEFAULT_MESS_RULES);
  const [messBazaarPhases, setMessBazaarPhases] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_MESS) || 'null');
      if (Array.isArray(saved?.bazaarPhases) && saved.bazaarPhases.length > 0) {
        return saved.bazaarPhases.map((p, idx) => ({
          ...p,
          dateEntries: Array.isArray(p.dateEntries) && p.dateEntries.length > 0
            ? p.dateEntries
            : [{ id: (idx + 1) * 100 + 1, date: '', amount: parseFloat(p.amount) || 0, note: p.note || '' }]
        }));
      }
      return DEFAULT_MESS_PHASES;
    } catch {
      return DEFAULT_MESS_PHASES;
    }
  });
  const [messBazaarNotes, setMessBazaarNotes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_MESS) || 'null');
      return Array.isArray(saved?.bazaarNotes) ? saved.bazaarNotes : [];
    } catch {
      return [];
    }
  });
  const [newBazaarNoteDate, setNewBazaarNoteDate] = useState(() => formatIsoDate(new Date()));
  const [newBazaarNoteTitle, setNewBazaarNoteTitle] = useState('');
  const [newBazaarNoteItems, setNewBazaarNoteItems] = useState('');

  const [messMealSheet35, setMessMealSheet35] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_MESS) || 'null');
      const startIso = saved?.startDate || formatIsoDate(new Date());
      const menuList = Array.isArray(saved?.weeklyMenu) && saved.weeklyMenu.length > 0 ? saved.weeklyMenu : DEFAULT_MESS_WEEKLY_MENU;
      if (Array.isArray(saved?.mealSheet35) && saved.mealSheet35.length === 35) {
        const synced = syncSheetWithCalendar(saved.mealSheet35, startIso, menuList);
        return synced.map((row, idx) => {
          const customDate = saved.mealSheet35[idx]?.calendarDate;
          if (customDate && parseIsoDateSafe(customDate)) {
            const wd = getBanglaWeekdayFromIso(customDate, row.weekday);
            const matched = menuList.find((m) => m.day === wd) || menuList[idx % 7];
            return {
              ...row,
              calendarDate: customDate,
              weekday: wd,
              morningMenu: matched.morning,
              nightMenu: matched.night,
              mealsByMember: saved.mealSheet35[idx]?.mealsByMember || row.mealsByMember
            };
          }
          return {
            ...row,
            mealsByMember: saved.mealSheet35[idx]?.mealsByMember || row.mealsByMember
          };
        });
      }
      const mList = Array.isArray(saved?.members) && saved.members.length > 0 ? saved.members : DEFAULT_MESS_MEMBERS;
      return buildDefault35DaySheet(mList, menuList, startIso);
    } catch {
      return buildDefault35DaySheet(DEFAULT_MESS_MEMBERS, DEFAULT_MESS_WEEKLY_MENU, formatIsoDate(new Date()));
    }
  });
  const [messUtilityBills, setMessUtilityBills] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_MESS) || 'null');
      return Array.isArray(saved?.utilityBills) && saved.utilityBills.length > 0 ? saved.utilityBills : DEFAULT_MESS_BILLS;
    } catch {
      return DEFAULT_MESS_BILLS;
    }
  });
  const [newMessBillTitle, setNewMessBillTitle] = useState('');
  const [newMessBillAmount, setNewMessBillAmount] = useState('');

  // UMS Quick Access & 3D Smart Card State (Link text hidden in UI)
  const umsUrl = 'https://ums.seu.edu.bd/sign-in?redirectURL=%2Fdashboard';
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  const [isCardLaunching, setIsCardLaunching] = useState(false);

  // 3D HMI Console Interactive State
  const [hmiTilt, setHmiTilt] = useState({ sx: 10, sy: 0 });
  const [hmiClusterMode, setHmiClusterMode] = useState('CGPA');
  const [hmiActiveModal, setHmiActiveModal] = useState(null);
  const [hmiClock, setHmiClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setHmiClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleHmiConsoleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setHmiTilt({
      sx: Number((10 - py * 12).toFixed(1)),
      sy: Number((px * 16).toFixed(1))
    });
  };

  const handleHmiConsoleLeave = () => {
    setHmiTilt({ sx: 10, sy: 0 });
  };

  const handleHmiCardMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((0.5 - y / rect.height) * 18).toFixed(1);
    const ry = ((x / rect.width - 0.5) * 18).toFixed(1);
    const gx = `${Math.round((x / rect.width) * 100)}%`;
    const gy = `${Math.round((y / rect.height) * 100)}%`;
    e.currentTarget.style.setProperty('--rx', `${rx}deg`);
    e.currentTarget.style.setProperty('--ry', `${ry}deg`);
    e.currentTarget.style.setProperty('--gx', gx);
    e.currentTarget.style.setProperty('--gy', gy);
  };

  const handleHmiCardLeave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    setCardTilt({
      rotateX: (0.5 - py) * 28,
      rotateY: (px - 0.5) * 28,
      glowX: Math.round(px * 100),
      glowY: Math.round(py * 100)
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  };

  const handleOpenUms = () => {
    setIsCardLaunching(true);
    setTimeout(() => {
      window.open(umsUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        setIsCardLaunching(false);
      }, 450);
    }, 360);
  };

  // Todo / Task List State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Prepare for Midterm Examination (Dec 01 - 08)', completed: false },
    { id: 2, text: 'Complete Web Programming Lab assignment', completed: true }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // SEU Official Academic Calendar Notices State
  const [notices, setNotices] = useState([
    { id: 1, title: 'Midterm Examination (8 Days)', date: 'Dec 01 - 08, 2026', type: 'exam' },
    { id: 2, title: 'Victory Day (Holiday)', date: 'Dec 16, 2026', type: 'holiday' },
    { id: 3, title: 'Pre-registration for Spring Semester 2027', date: 'Dec 29 - 31, 2026', type: 'registration' },
    { id: 4, title: 'Last Date of Classes (UG-Regular)', date: 'Jan 14, 2027', type: 'deadline' },
    { id: 5, title: 'Final Examination (8 Days)', date: 'Jan 17 - 24, 2027', type: 'exam' },
    { id: 6, title: 'Classes begin of Spring 2027', date: 'Feb 03, 2027', type: 'start' }
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDate, setNewNoticeDate] = useState('');

  const getAuthHeaders = useCallback(() => {
    const activeToken = token || localStorage.getItem('token');
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  }, [token]);

  const fetchUserCoursesCount = useCallback((activeToken) => {
    const useToken = activeToken || token || localStorage.getItem('token');
    if (!useToken) {
      setCoursesCount(0);
      return;
    }

    axios
      .get(`${API_BASE}/courses`, { headers: { Authorization: `Bearer ${useToken}` } })
      .then((res) => {
        if (Array.isArray(res.data?.courses)) {
          setCoursesCount(res.data.courses.length);
        } else {
          setCoursesCount(0);
        }
      })
      .catch(() => {
        setCoursesCount(0);
      });
  }, [token]);

  const applyMessServerState = useCallback((data) => {
    if (!data) return;
    if (Array.isArray(data.members) && data.members.length > 0) setMessMembers(data.members);
    if (Array.isArray(data.weeklyMenu) && data.weeklyMenu.length > 0) setMessWeeklyMenu(data.weeklyMenu);
    if (Array.isArray(data.bazaarPhases) && data.bazaarPhases.length > 0) {
      setMessBazaarPhases((prev) =>
        data.bazaarPhases.map((serverP, idx) => {
          const localMatch = prev.find((lp) => Number(lp.phaseNumber) === Number(serverP.phaseNumber));
          const serverAmt = parseFloat(serverP.amount) || 0;
          const localEntries = localMatch?.dateEntries;
          const localEntriesSum = Array.isArray(localEntries)
            ? localEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
            : 0;
          const entries =
            Array.isArray(localEntries) && localEntries.length > 0 && (localEntriesSum > 0 || serverAmt === 0)
              ? localEntries
              : [{ id: (idx + 1) * 100 + 1, date: '', amount: serverAmt, note: serverP.note || '' }];
          return {
            ...serverP,
            dateEntries: entries
          };
        })
      );
    }
    if (Array.isArray(data.mealSheet35) && data.mealSheet35.length === 35) {
      setMessMealSheet35((prev) =>
        prev.map((localRow, idx) => {
          const srvRow = data.mealSheet35[idx] || {};
          return {
            ...localRow,
            mealsByMember: srvRow.mealsByMember || localRow.mealsByMember || {}
          };
        })
      );
    }
    if (Array.isArray(data.utilityBills)) setMessUtilityBills(data.utilityBills);
  }, []);

  // Load user-specific data from MySQL (with localStorage fallback)
  useEffect(() => {
    const savedTxn = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    const localTxns = savedTxn ? JSON.parse(savedTxn) : [];

    const savedBudget = localStorage.getItem(STORAGE_KEY_BUDGET);
    const localBudget = savedBudget ? JSON.parse(savedBudget) : { budget: 10000, initialBalance: 0 };

    const savedCgpa = localStorage.getItem(STORAGE_KEY_CGPA);
    const localCgpa = savedCgpa ? JSON.parse(savedCgpa) : { cgpa: '3.17', totalCredits: '90' };

    setTransactions(localTxns);
    setMonthlyBudget(localBudget);
    setCgpaData(localCgpa);

    let parsedMess = null;
    try {
      const savedMessRaw = localStorage.getItem(STORAGE_KEY_MESS);
      if (savedMessRaw) {
        parsedMess = JSON.parse(savedMessRaw);
        applyMessServerState(parsedMess);
        if (parsedMess?.startDate) setMessStartDate(parsedMess.startDate);
        if (Array.isArray(parsedMess?.bazaarNotes)) setMessBazaarNotes(parsedMess.bazaarNotes);
        if (Array.isArray(parsedMess?.mealSheet35) && parsedMess.mealSheet35.length === 35) {
          setMessMealSheet35(parsedMess.mealSheet35);
        }
      }
    } catch {}

    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) {
      setCoursesCount(0);
      return;
    }

    axios
      .get(`${API_BASE}/finance/state`, { headers: { Authorization: `Bearer ${activeToken}` } })
      .then((res) => {
        const data = res.data || {};

        const dbBudget = Number(data.monthly_budget);
        const dbBalance = Number(data.initial_balance);
        if (!Number.isNaN(dbBudget) && !Number.isNaN(dbBalance) && (dbBudget > 0 || dbBalance > 0)) {
          const formattedBudget = {
            budget: dbBudget > 0 ? dbBudget : localBudget.budget,
            initialBalance: dbBalance
          };
          setMonthlyBudget(formattedBudget);
          localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(formattedBudget));
        }

        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          const formattedTxns = data.transactions.map((tr) => ({
            id: tr.id,
            type: tr.type,
            category: tr.category,
            amount: parseFloat(tr.amount),
            note: tr.note || '',
            date: tr.created_at ? new Date(tr.created_at).toLocaleDateString() : new Date().toLocaleDateString()
          }));
          setTransactions(formattedTxns);
          localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(formattedTxns));
        }

        const dbCgpa = Number(data.current_cgpa);
        const dbCredits = Number(data.completed_credits);
        if (!Number.isNaN(dbCgpa) && !Number.isNaN(dbCredits) && (dbCgpa > 0 || dbCredits > 0)) {
          const formattedCgpa = {
            cgpa: dbCgpa > 0 ? String(dbCgpa) : localCgpa.cgpa,
            totalCredits: dbCredits > 0 ? String(dbCredits) : localCgpa.totalCredits
          };
          setCgpaData(formattedCgpa);
          localStorage.setItem(STORAGE_KEY_CGPA, JSON.stringify(formattedCgpa));
        }
      })
      .catch(() => {});

    axios
      .get(`${API_BASE}/mess/state`, { headers: { Authorization: `Bearer ${activeToken}` } })
      .then((res) => {
        if (res.data) {
          applyMessServerState(res.data);
          setMessBazaarNotes((prevNotes) => {
            const currentSaved = (() => {
              try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY_MESS) || 'null');
              } catch {
                return null;
              }
            })();
            const mergedNotes = Array.isArray(currentSaved?.bazaarNotes) && currentSaved.bazaarNotes.length > 0
              ? currentSaved.bazaarNotes
              : prevNotes;
            const mergedStart = currentSaved?.startDate || parsedMess?.startDate || messStartDate;
            const mergedSheet = Array.isArray(currentSaved?.mealSheet35) && currentSaved.mealSheet35.length === 35
              ? currentSaved.mealSheet35
              : messMealSheet35;
            localStorage.setItem(
              STORAGE_KEY_MESS,
              JSON.stringify({
                ...res.data,
                startDate: mergedStart,
                bazaarNotes: mergedNotes,
                mealSheet35: mergedSheet
              })
            );
            return mergedNotes;
          });
        }
      })
      .catch(() => {});

    fetchUserCoursesCount(activeToken);
  }, [token, STORAGE_KEY_TRANSACTIONS, STORAGE_KEY_BUDGET, STORAGE_KEY_CGPA, STORAGE_KEY_MESS, fetchUserCoursesCount, applyMessServerState]);

  // Save Mess state to localStorage whenever updated
  useEffect(() => {
    const messSnapshot = {
      startDate: messStartDate,
      members: messMembers,
      weeklyMenu: messWeeklyMenu,
      bazaarPhases: messBazaarPhases,
      bazaarNotes: messBazaarNotes,
      mealSheet35: messMealSheet35,
      utilityBills: messUtilityBills
    };
    localStorage.setItem(STORAGE_KEY_MESS, JSON.stringify(messSnapshot));
  }, [messStartDate, messMembers, messWeeklyMenu, messBazaarPhases, messBazaarNotes, messMealSheet35, messUtilityBills, STORAGE_KEY_MESS]);

  // Mess Handlers (State + MySQL Sync)
  const handleMessMemberField = async (memberId, field, rawValue) => {
    const nextValue =
      field === 'extraAddOn' || field === 'extraDeposit'
        ? Math.max(0, parseFloat(rawValue) || 0)
        : rawValue;

    setMessMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, [field]: nextValue } : m))
    );

    try {
      const res = await axios.put(
        `${API_BASE}/mess/members/${memberId}`,
        { [field]: nextValue },
        { headers: getAuthHeaders() }
      );
      if (res.data) applyMessServerState(res.data);
    } catch {}
  };

  const handleMessMenuField = async (dayIndex, field, value) => {
    const updatedMenu = messWeeklyMenu.map((item, idx) =>
      idx === dayIndex ? { ...item, [field]: value } : item
    );
    setMessWeeklyMenu(updatedMenu);
    setMessMealSheet35((prev) =>
      prev.map((row, idx) => {
        const wd = getBanglaWeekdayFromIso(row.calendarDate, updatedMenu[idx % 7]?.day);
        const matched = updatedMenu.find((m) => m.day === wd) || updatedMenu[idx % 7] || DEFAULT_MESS_WEEKLY_MENU[idx % 7];
        return {
          ...row,
          weekday: wd,
          morningMenu: matched.morning,
          nightMenu: matched.night
        };
      })
    );

    try {
      const res = await axios.put(
        `${API_BASE}/mess/menu/${dayIndex}`,
        { [field]: value },
        { headers: getAuthHeaders() }
      );
      if (res.data) applyMessServerState(res.data);
    } catch {}
  };

  const syncPhaseTotalsToBackend = async (phaseNumber, updatedPhaseObj) => {
    try {
      const res = await axios.put(
        `${API_BASE}/mess/bazaar-phases/${phaseNumber}`,
        {
          dateRange: updatedPhaseObj.dateRange,
          memberId: updatedPhaseObj.memberId,
          amount: updatedPhaseObj.amount,
          note: updatedPhaseObj.note
        },
        { headers: getAuthHeaders() }
      );
      if (res.data) applyMessServerState(res.data);
    } catch {}
  };

  const handleMessPhaseField = async (phaseNumber, field, rawValue) => {
    const nextValue =
      field === 'amount'
        ? Math.max(0, parseFloat(rawValue) || 0)
        : field === 'memberId'
        ? Number(rawValue)
        : rawValue;

    let targetSnapshot = null;
    setMessBazaarPhases((prev) =>
      prev.map((p) => {
        if (p.phaseNumber !== phaseNumber) return p;
        const nextEntries =
          field === 'amount'
            ? (Array.isArray(p.dateEntries) && p.dateEntries.length > 0
                ? p.dateEntries.map((entry, idx) => (idx === 0 ? { ...entry, amount: nextValue } : entry))
                : [{ id: Date.now(), date: '', amount: nextValue, note: p.note || '' }])
            : p.dateEntries;
        const nextObj = { ...p, [field]: nextValue, dateEntries: nextEntries };
        targetSnapshot = nextObj;
        return nextObj;
      })
    );

    if (targetSnapshot) {
      await syncPhaseTotalsToBackend(phaseNumber, targetSnapshot);
    }
  };

  const handleAddPhaseDateEntry = (phaseNumber) => {
    setMessBazaarPhases((prev) =>
      prev.map((p) => {
        if (p.phaseNumber !== phaseNumber) return p;
        const currentEntries = Array.isArray(p.dateEntries) ? p.dateEntries : [];
        return {
          ...p,
          dateEntries: [
            ...currentEntries,
            { id: Date.now() + Math.floor(Math.random() * 1000), date: formatIsoDate(new Date()), amount: 0, note: '' }
          ]
        };
      })
    );
  };

  const handlePhaseDateEntryChange = async (phaseNumber, entryId, field, rawValue) => {
    const nextVal = field === 'amount' ? Math.max(0, parseFloat(rawValue) || 0) : rawValue;
    let targetSnapshot = null;

    setMessBazaarPhases((prev) =>
      prev.map((p) => {
        if (p.phaseNumber !== phaseNumber) return p;
        const nextEntries = (Array.isArray(p.dateEntries) ? p.dateEntries : []).map((entry) =>
          entry.id === entryId ? { ...entry, [field]: nextVal } : entry
        );
        const totalAmt = nextEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const combinedNote = nextEntries
          .filter((e) => e.date || e.note || (parseFloat(e.amount) || 0) > 0)
          .map((e) => `${e.date ? `[${e.date}] ` : ''}${e.note || 'বাজার'}${parseFloat(e.amount) ? ` (৳${parseFloat(e.amount)})` : ''}`)
          .join(', ');
        const nextObj = {
          ...p,
          dateEntries: nextEntries,
          amount: totalAmt,
          note: combinedNote || p.note
        };
        targetSnapshot = nextObj;
        return nextObj;
      })
    );

    if (targetSnapshot) {
      await syncPhaseTotalsToBackend(phaseNumber, targetSnapshot);
    }
  };

  const handleRemovePhaseDateEntry = async (phaseNumber, entryId) => {
    let targetSnapshot = null;
    setMessBazaarPhases((prev) =>
      prev.map((p) => {
        if (p.phaseNumber !== phaseNumber) return p;
        const filtered = (Array.isArray(p.dateEntries) ? p.dateEntries : []).filter((e) => e.id !== entryId);
        const nextEntries = filtered.length > 0 ? filtered : [{ id: Date.now(), date: '', amount: 0, note: '' }];
        const totalAmt = nextEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const nextObj = { ...p, dateEntries: nextEntries, amount: totalAmt };
        targetSnapshot = nextObj;
        return nextObj;
      })
    );
    if (targetSnapshot) {
      await syncPhaseTotalsToBackend(phaseNumber, targetSnapshot);
    }
  };

  const handleAddBazaarNote = (e) => {
    e.preventDefault();
    if (!newBazaarNoteTitle.trim() && !newBazaarNoteItems.trim()) return;
    const weekday = getBanglaWeekdayFromIso(newBazaarNoteDate, '');
    const noteItem = {
      id: Date.now(),
      date: newBazaarNoteDate || formatIsoDate(new Date()),
      weekday,
      title: newBazaarNoteTitle.trim() || 'বাজারের লিস্ট',
      items: newBazaarNoteItems.trim()
    };
    setMessBazaarNotes((prev) => [noteItem, ...prev]);
    setNewBazaarNoteTitle('');
    setNewBazaarNoteItems('');
    showToast('বাজারের লিস্ট নোট সেভ হয়েছে!');
  };

  const handleDeleteBazaarNote = (noteId) => {
    setMessBazaarNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const applyCalendarStartDate = (newStartIso) => {
    const parsedStart = parseIsoDateSafe(newStartIso);
    if (!parsedStart) {
      showToast('সঠিক তারিখ দিন (যেমন: 2026-11-20)');
      return;
    }
    const normalizedStart = formatIsoDate(parsedStart);
    setMessStartDate(normalizedStart);
    setMessMealSheet35((prev) =>
      prev.map((row, idx) => {
        const dt = new Date(parsedStart.getFullYear(), parsedStart.getMonth(), parsedStart.getDate() + idx);
        const iso = formatIsoDate(dt);
        const weekday = getBanglaWeekdayFromIso(iso, row.weekday);
        const matchedMenu =
          messWeeklyMenu.find((m) => m.day === weekday) ||
          messWeeklyMenu[idx % 7] ||
          DEFAULT_MESS_WEEKLY_MENU[idx % 7];
        return {
          ...row,
          calendarDate: iso,
          weekday,
          morningMenu: matchedMenu.morning,
          nightMenu: matchedMenu.night
        };
      })
    );
    showToast(`ক্যালেন্ডার আপডেট হয়েছে (${normalizedStart})!`);
  };

  const handleMessStartDateChange = (newStartIso) => {
    setMessStartDate(newStartIso);
  };

  const handleMessRowDateChange = (dayNumber, newIsoDate) => {
    setMessMealSheet35((prev) =>
      prev.map((r) => {
        if (r.day !== dayNumber) return r;
        const parsed = parseIsoDateSafe(newIsoDate);
        if (!parsed) {
          return { ...r, calendarDate: newIsoDate };
        }
        const normalizedIso = formatIsoDate(parsed);
        const weekday = getBanglaWeekdayFromIso(normalizedIso, r.weekday);
        const matchedMenu =
          messWeeklyMenu.find((m) => m.day === weekday) ||
          messWeeklyMenu[(dayNumber - 1) % 7] ||
          DEFAULT_MESS_WEEKLY_MENU[(dayNumber - 1) % 7];
        return {
          ...r,
          calendarDate: normalizedIso,
          weekday,
          morningMenu: matchedMenu.morning,
          nightMenu: matchedMenu.night
        };
      })
    );
  };

  const handleMessMealCell = async (dayNumber, memberId, rawValue) => {
    const parsed = Math.max(0, parseFloat(rawValue) || 0);
    setMessMealSheet35((prev) =>
      prev.map((row) =>
        row.day === dayNumber
          ? {
              ...row,
              mealsByMember: {
                ...row.mealsByMember,
                [memberId]: rawValue === '' ? 0 : parsed
              }
            }
          : row
      )
    );

    try {
      const res = await axios.put(
        `${API_BASE}/mess/meals`,
        { dayNumber, memberId, meals: rawValue === '' ? 0 : parsed },
        { headers: getAuthHeaders() }
      );
      if (res.data) applyMessServerState(res.data);
    } catch {}
  };

  const handleMessBillChange = async (billId, field, rawValue) => {
    const nextValue = field === 'amount' ? Math.max(0, parseFloat(rawValue) || 0) : rawValue;
    setMessUtilityBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, [field]: nextValue } : b))
    );

    try {
      const res = await axios.put(
        `${API_BASE}/mess/bills/${billId}`,
        { [field]: nextValue },
        { headers: getAuthHeaders() }
      );
      if (res.data) applyMessServerState(res.data);
    } catch {}
  };

  const handleAddMessBill = async (e) => {
    e.preventDefault();
    if (!newMessBillTitle.trim()) return;
    const titleVal = newMessBillTitle.trim();
    const amountVal = Math.max(0, parseFloat(newMessBillAmount) || 0);
    const tempId = Date.now();

    setMessUtilityBills((prev) => [...prev, { id: tempId, name: titleVal, amount: amountVal }]);
    setNewMessBillTitle('');
    setNewMessBillAmount('');

    try {
      const res = await axios.post(
        `${API_BASE}/mess/bills`,
        { title: titleVal, amount: amountVal },
        { headers: getAuthHeaders() }
      );
      if (res.data) applyMessServerState(res.data);
    } catch {}

    showToast('নতুন ইউটিলিটি বিল যোগ করা হয়েছে!');
  };

  const handleDeleteMessBill = async (billId) => {
    setMessUtilityBills((prev) => prev.filter((b) => b.id !== billId));
    try {
      const res = await axios.delete(`${API_BASE}/mess/bills/${billId}`, {
        headers: getAuthHeaders()
      });
      if (res.data) applyMessServerState(res.data);
    } catch {}
  };

  // Save Budget & Initial Balance to MySQL + localStorage
  const handleUpdateBudget = async (newBudgetData) => {
    setMonthlyBudget(newBudgetData);
    localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(newBudgetData));

    try {
      await axios.put(
        `${API_BASE}/finance/budget`,
        {
          monthly_budget: parseFloat(newBudgetData.budget) || 10000,
          initial_balance: parseFloat(newBudgetData.initialBalance) || 0
        },
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      console.error('Budget MySQL save error:', err);
    }
  };

  // Save CGPA & Completed Credits to MySQL + localStorage
  const handleUpdateCgpa = async (newData) => {
    setCgpaData(newData);
    localStorage.setItem(STORAGE_KEY_CGPA, JSON.stringify(newData));

    try {
      await axios.put(
        `${API_BASE}/finance/cgpa`,
        {
          current_cgpa: parseFloat(newData.cgpa) || 0,
          completed_credits: parseFloat(newData.totalCredits) || 0
        },
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      console.error('CGPA MySQL save error:', err);
    }
  };

  // Sync LocalStorage for Transactions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions, STORAGE_KEY_TRANSACTIONS]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle Browser History (Back Button Support)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState({ tab: tabId }, '', `#${tabId}`);
    if (tabId === 'dashboard' || tabId === 'courses') {
      fetchUserCoursesCount();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setCoursesCount(0);
    setActiveTab('dashboard');
    showToast('লগআউট করা হয়েছে।');
  };

  // Expense Handler (MySQL + UI State)
  const handleAddTxn = async (e) => {
    e.preventDefault();
    if (!txnForm.amount) return;

    const amountNum = parseFloat(txnForm.amount);
    const newTxn = {
      ...txnForm,
      id: Date.now(),
      amount: amountNum,
      date: new Date().toLocaleDateString()
    };

    setTransactions([newTxn, ...transactions]);
    setTxnForm({ type: 'expense', category: 'Food', amount: '', note: '' });

    try {
      const res = await axios.post(
        `${API_BASE}/finance/transactions`,
        {
          type: txnForm.type,
          category: txnForm.category || 'General',
          amount: amountNum,
          note: txnForm.note || ''
        },
        { headers: getAuthHeaders() }
      );
      if (res.data?.transaction?.id) {
        setTransactions((prev) =>
          prev.map((item) => (item.id === newTxn.id ? { ...item, id: res.data.transaction.id } : item))
        );
      }
    } catch (err) {
      console.error('Transaction MySQL save error:', err);
    }

    showToast('ট্রানজ্যাকশন সফলভাবে সেভ হয়েছে!');
  };

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = (parseFloat(monthlyBudget.initialBalance) || 0) + totalIncome - totalExpense;
  const budgetLimit = parseFloat(monthlyBudget.budget) || 10000;
  const budgetUsedPercent = Math.min(Math.round((totalExpense / budgetLimit) * 100), 100);
  const cgpaPercent = Math.min(Math.round(((parseFloat(cgpaData.cgpa) || 0) / 4.0) * 100), 100);
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const taskCompletionPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Mess Calculations
  const messTotalBazaar = messBazaarPhases.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const messMemberMealsMap = {};
  let messGrandTotalMeals = 0;
  messMembers.forEach((m) => {
    const mTotal = messMealSheet35.reduce(
      (acc, row) => acc + (parseFloat(row.mealsByMember?.[m.id]) || 0),
      0
    );
    messMemberMealsMap[m.id] = mTotal;
    messGrandTotalMeals += mTotal;
  });
  const messMealRate = messGrandTotalMeals > 0 ? messTotalBazaar / messGrandTotalMeals : 0;
  const messTotalUtilityBills = messUtilityBills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const messPerMemberUtility = messMembers.length > 0 ? messTotalUtilityBills / messMembers.length : 0;
  const messSettlements = messMembers.map((m) => {
    const phasePaid = messBazaarPhases
      .filter((p) => Number(p.memberId) === Number(m.id))
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const extraDep = parseFloat(m.extraDeposit) || 0;
    const totalPaidOrDeposited = phasePaid + extraDep;
    const totalMeals = messMemberMealsMap[m.id] || 0;
    const mealCost = totalMeals * messMealRate;
    const extraAddOn = parseFloat(m.extraAddOn) || 0;
    const totalExpenseForMember = mealCost + messPerMemberUtility + extraAddOn;
    const netBalance = totalPaidOrDeposited - totalExpenseForMember;
    return {
      ...m,
      phasePaid,
      totalPaidOrDeposited,
      totalMeals,
      mealCost,
      utilityShare: messPerMemberUtility,
      extraAddOn,
      totalExpenseForMember,
      netBalance
    };
  });

  // Gauge / Cluster Computed Values
  const clusterValueMap = {
    CGPA: { main: cgpaData.cgpa, unit: '/ 4.00 CGPA', pct: cgpaPercent },
    BUDGET: { main: `${budgetUsedPercent}%`, unit: 'BUDGET USED', pct: budgetUsedPercent },
    TASKS: { main: `${taskCompletionPercent}%`, unit: 'TASKS DONE', pct: taskCompletionPercent },
    UMS: { main: String(coursesCount), unit: 'ACTIVE COURSES', pct: Math.min(coursesCount * 20, 100) }
  };
  const activeCluster = clusterValueMap[hmiClusterMode] || clusterValueMap.CGPA;
  const gaugeArcLength = 251;
  const gaugeDash = `${Math.round((activeCluster.pct / 100) * gaugeArcLength)} ${gaugeArcLength}`;
  const needleAngle = -110 + (activeCluster.pct / 100) * 220;
  const ringCircumference = 201;
  const ringDash = `${Math.round((taskCompletionPercent / 100) * ringCircumference)} ${ringCircumference}`;

  // CGPA Target Calculator
  const handleCalculateTarget = (e) => {
    e.preventDefault();
    const currentCgpa = parseFloat(cgpaData.cgpa) || 3.17;
    const doneCredits = parseFloat(cgpaData.totalCredits) || 90;
    const target = parseFloat(targetCgpa);
    const nextCred = parseFloat(nextCredits);

    if (target && nextCred) {
      const req = (target * (doneCredits + nextCred) - (doneCredits * currentCgpa)) / nextCred;
      if (req > 4.0) setRequiredGpa("GPA requirement exceeds 4.00");
      else if (req <= 0) setRequiredGpa("Target already achieved!");
      else setRequiredGpa(req.toFixed(2));
      showToast('সিজিপিএ ক্যালকুলেশন সম্পন্ন হয়েছে।');
    }
  };

  // Learning Hub Lesson & Resilient Dynamic Quiz Handlers
  const handleSelectHubLesson = (topicTitle, lessonObj) => {
    setActiveLesson({
      courseTitle: topicTitle,
      title: lessonObj.title,
      resources: lessonObj.resources || []
    });
    setQuizQuestions([]);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizError('');
    setQuizSourceNote('');
  };

  const handleGenerateHubQuiz = async (count = 10) => {
    if (!activeLesson) return;
    setLoadingQuiz(true);
    setQuizError('');
    setQuizSourceNote('');
    setQuizSubmitted(false);
    setSelectedAnswers({});

    const payload = {
      userId: user?.id,
      courseTitle: activeLesson.courseTitle,
      lessonTitle: activeLesson.title,
      count,
      avoidQuestions: seenQuestions
    };

    try {
      let resData = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const res = await axios.post(`${API_BASE}/quiz/generate`, payload, {
            headers: getAuthHeaders(),
            timeout: 15000
          });
          if (Array.isArray(res.data?.questions) && res.data.questions.length > 0) {
            resData = res.data;
            break;
          }
        } catch (innerErr) {
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 600));
          } else {
            throw innerErr;
          }
        }
      }

      if (resData && Array.isArray(resData.questions) && resData.questions.length > 0) {
        setQuizQuestions(resData.questions);
        setQuizSourceNote('AI সার্ভার থেকে নতুন কুইজ তৈরি হয়েছে।');
        const newTexts = resData.questions.map((q) => q.question).filter(Boolean);
        setSeenQuestions((prev) => [...prev, ...newTexts]);
      } else {
        throw new Error('Empty quiz response');
      }
    } catch {
      const fallbackQs = buildFallbackQuizQuestions(
        activeLesson.courseTitle,
        activeLesson.title,
        count,
        seenQuestions
      );
      setQuizQuestions(fallbackQs);
      setQuizSourceNote('AI মডেল সাময়িকভাবে ব্যস্ত থাকায় স্মার্ট কুইজ ব্যাংক থেকে নতুন প্রশ্ন লোড করা হয়েছে।');
      const newTexts = fallbackQs.map((q) => q.question).filter(Boolean);
      setSeenQuestions((prev) => [...prev, ...newTexts]);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const hubQuizScore = quizQuestions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.answerIndex ? 1 : 0);
  }, 0);

  // Theme Object
  const t = {
    bg: theme === 'dark' ? '#09090b' : '#f8fafc',
    cardBg: theme === 'dark' ? '#121216' : '#ffffff',
    text: theme === 'dark' ? '#f4f4f5' : '#0f172a',
    subText: theme === 'dark' ? '#a1a1aa' : '#64748b',
    border: theme === 'dark' ? '#27272a' : '#e2e8f0',
    headerBg: theme === 'dark' ? '#121216' : '#ffffff',
  };

  // If not logged in, show Auth Component
  if (!token) {
    return <Auth setToken={setToken} setUser={setUser} />;
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", margin: 0, padding: 0, background: t.bg, minHeight: '100vh', color: t.text, transition: 'background 0.3s, color 0.3s' }}>
      
      <style>{`
        ${HMI_STYLES}
        .nav-btn { transition: all 0.25s ease; cursor: pointer; }
        .nav-btn:hover { background: rgba(249, 115, 22, 0.15) !important; color: #f97316 !important; }
        .card-hover { transition: all 0.3s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(249, 115, 22, 0.5) !important; box-shadow: 0 10px 30px -10px rgba(249, 115, 22, 0.2); }
        .back-btn { background: #27272a; color: #fff; border: 1px solid #3f3f46; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 20px; transition: 0.2s; }
        .back-btn:hover { background: #3f3f46; }
        .ums-floating-stage { perspective: 1200px; }
        .ums-3d-marquee-box {
          position: relative;
          overflow: hidden;
          transform-style: preserve-3d;
          box-shadow: 0 16px 32px -10px rgba(0, 0, 0, 0.78), 0 0 22px rgba(249, 115, 22, 0.16);
        }
        @keyframes ums3dSlideTriColor {
          0% {
            transform: translateX(-28%) rotateY(-8deg);
            color: #ef4444;
            text-shadow: 0 2px 0 #7f1d1d, 0 5px 0 #450a0a, 0 0 18px rgba(239, 68, 68, 0.75);
          }
          33% {
            transform: translateX(0%) rotateY(0deg);
            color: #facc15;
            text-shadow: 0 2px 0 #854d0e, 0 5px 0 #422006, 0 0 18px rgba(250, 204, 21, 0.75);
          }
          66% {
            transform: translateX(28%) rotateY(8deg);
            color: #fb923c;
            text-shadow: 0 2px 0 #9a3412, 0 5px 0 #431407, 0 0 18px rgba(251, 146, 60, 0.75);
          }
          100% {
            transform: translateX(-28%) rotateY(-8deg);
            color: #ef4444;
            text-shadow: 0 2px 0 #7f1d1d, 0 5px 0 #450a0a, 0 0 18px rgba(239, 68, 68, 0.75);
          }
        }
        .ums-3d-tri-text {
          display: inline-block;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.04em;
          white-space: nowrap;
          animation: ums3dSlideTriColor 5.2s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .ums-3d-key {
          box-shadow: 0 5px 0 #9a3412, 0 12px 24px rgba(249, 115, 22, 0.42);
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        .ums-3d-key:active {
          transform: translateY(3px);
          box-shadow: 0 2px 0 #9a3412, 0 6px 14px rgba(249, 115, 22, 0.3);
        }
        .ums-3d-card {
          transform-style: preserve-3d;
          transition: transform 0.18s ease-out, box-shadow 0.25s ease;
        }
        .ums-3d-card.launching {
          transform: rotateY(180deg) scale(1.05) !important;
          transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.42s ease !important;
          box-shadow: 0 0 35px rgba(249, 115, 22, 0.75), 0 0 70px rgba(234, 88, 12, 0.45) !important;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', right: '25px', zIndex: 99999, background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', padding: '14px 24px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🔔</span> {toastMessage}
        </div>
      )}

      {/* Header Navbar */}
      <header style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`, padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: t.text }}>Control AI Policy</h1>
        </div>

        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'expenses', label: '💰 Expenses' },
            { id: 'cgpa', label: '📈 CGPA' },
            { id: 'attendance', label: '🏠 House & Bills' },
            { id: 'courses', label: '📚 Courses' },
            { id: 'chat', label: '🤖 AI Chatbot' },
            { id: 'hub', label: '💡 Learning Hub' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => changeTab(tab.id)}
              className="nav-btn"
              style={{
                background: activeTab === tab.id ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                color: activeTab === tab.id ? '#f97316' : t.subText,
                border: activeTab === tab.id ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid transparent',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '13px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ background: t.border, color: t.text, border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <span style={{ fontSize: '13px', color: t.text }}>👤 {user ? user.name : 'Zim'}</span>
          <button
            onClick={handleLogout}
            style={{ background: t.border, color: '#f87171', border: '1px solid #3f3f46', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ padding: '30px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              
              {/* Orange Gradient Corner Shadow Banner */}
              <div style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' : 'linear-gradient(135deg, #fed7aa 0%, #ffedd5 100%)', border: '1px solid rgba(249, 115, 22, 0.4)', color: t.text, padding: '30px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Welcome back, {user ? user.name : 'Zim'}! ⚡</h2>
                <p style={{ margin: 0, color: t.subText, fontSize: '14px' }}>Personal Workspace • Smart Study, Finance & Productivity Suite</p>
              </div>

              {/* Floating 3D Tri-Color Moving Text + UMS Button + 3D Smart Card */}
              <div
                className="ums-floating-stage"
                style={{
                  marginBottom: '24px',
                  padding: '6px 2px 10px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                  <div
                    onClick={handleOpenUms}
                    title="Click to launch UMS Portal"
                    className="ums-3d-marquee-box"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      height: '46px',
                      padding: '0 18px',
                      borderRadius: '12px',
                      background: theme === 'dark' ? 'rgba(18, 18, 23, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="ums-3d-tri-text">
                      ⚡ UMS PORTAL LIVE • CLICK TO ACCESS ⚡
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96, y: 2 }}
                    type="button"
                    onClick={handleOpenUms}
                    className="ums-3d-key"
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    UMS
                  </motion.button>
                </div>

                {/* Interactive 3D Smart Card (Parallax Tilt + Flip/Glow) */}
                <div className="ums-3d-stage" style={{ width: '210px', height: '64px' }}>
                  <div
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    onClick={handleOpenUms}
                    className={`ums-3d-card ${isCardLaunching ? 'launching' : ''}`}
                    title="Move cursor for 3D tilt • Click to open UMS"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      border: isCardLaunching ? '1px solid #fb923c' : '1px solid rgba(249, 115, 22, 0.45)',
                      background: `radial-gradient(circle at ${cardTilt.glowX}% ${cardTilt.glowY}%, rgba(249, 115, 22, 0.28), rgba(18, 18, 22, 0.96) 68%)`,
                      boxShadow: isCardLaunching
                        ? '0 0 36px rgba(249, 115, 22, 0.8)'
                        : '0 14px 28px rgba(0, 0, 0, 0.55), 0 0 16px rgba(249, 115, 22, 0.16)',
                      transform: isCardLaunching
                        ? 'rotateY(180deg) scale(1.05)'
                        : `rotateX(${cardTilt.rotateX.toFixed(1)}deg) rotateY(${cardTilt.rotateY.toFixed(1)}deg)`,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ transform: isCardLaunching ? 'scaleX(-1)' : 'none' }}>
                      <div style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#fb923c', fontWeight: '700', textTransform: 'uppercase' }}>
                        {isCardLaunching ? 'Opening UMS...' : '3D Smart Pass'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#f4f4f5', marginTop: '2px' }}>
                        {user?.student_id || 'Personal • UMS Portal'}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '700',
                        boxShadow: '0 0 14px rgba(249, 115, 22, 0.55)',
                        transform: isCardLaunching ? 'scaleX(-1)' : 'none'
                      }}
                    >
                      ↗
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D-TILTED GLASSY HMI CONSOLE (.hmi-*) */}
              <div
                className="hmi-root"
                onMouseMove={handleHmiConsoleMove}
                onMouseLeave={handleHmiConsoleLeave}
              >
                <div className="hmi-bg-grid" />
                <div className="hmi-bg-glow a" />
                <div className="hmi-bg-glow b" />

                <div className="hmi-scene">
                  <div
                    className="hmi-console"
                    style={{ '--sx': `${hmiTilt.sx}deg`, '--sy': `${hmiTilt.sy}deg` }}
                  >
                    {/* Top Bar */}
                    <div className="hmi-topbar hmi-glass">
                      <span className="hmi-time">{hmiClock}</span>
                      <span className="hmi-top-center">◈ 3D HMI COMMAND CONSOLE • {user?.name || 'ZIM'}</span>
                      <span className="hmi-top-right">
                        <span>{cgpaData.totalCredits} CR</span>
                        <span>•</span>
                        <span>৳ {currentBalance}</span>
                      </span>
                    </div>

                    {/* Main 3-Column Row */}
                    <div className="hmi-main">
                      {/* Left Glass Panel */}
                      <div className="hmi-panel hmi-panel-left hmi-glass">
                        <h4 className="hmi-panel-title">Telemetry & Bars</h4>

                        <div>
                          <div className="hmi-bar-head">
                            <span>CGPA Index</span>
                            <b>{cgpaData.cgpa} <i>/ 4.00</i></b>
                          </div>
                          <div className="hmi-bar-track">
                            <div className="hmi-bar-fill" style={{ width: `${cgpaPercent}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="hmi-bar-head">
                            <span>Budget Used</span>
                            <b>{budgetUsedPercent}% <i>(৳{totalExpense})</i></b>
                          </div>
                          <div className="hmi-bar-track">
                            <div className={`hmi-bar-fill ${budgetUsedPercent >= 80 ? 'warn' : ''}`} style={{ width: `${budgetUsedPercent}%` }} />
                          </div>
                        </div>

                        <div className="hmi-tires">
                          <span className="hmi-tires-title">SYSTEM NODES</span>
                          <div className="hmi-car-top">
                            <span className="hmi-tire fl">CGPA {cgpaData.cgpa}</span>
                            <span className="hmi-tire fr">CRS {coursesCount}</span>
                            <div className="hmi-car-body" />
                            <span className="hmi-tire rl">TSK {taskCompletionPercent}%</span>
                            <span className="hmi-tire rr">BDG {budgetUsedPercent}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Center 3D Cluster */}
                      <div className="hmi-cluster hmi-glass">
                        <div className="hmi-gauge">
                          <svg className="hmi-gauge-svg" viewBox="0 0 300 300">
                            <defs>
                              <linearGradient id="hmiGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="60%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#f472b6" />
                              </linearGradient>
                            </defs>
                            <path
                              className="hmi-arc-track"
                              d="M 52 218 A 115 115 0 1 1 248 218"
                              strokeDasharray={`${gaugeArcLength} ${gaugeArcLength}`}
                            />
                            <path
                              className="hmi-arc-value"
                              d="M 52 218 A 115 115 0 1 1 248 218"
                              stroke="url(#hmiGaugeGrad)"
                              strokeDasharray={gaugeDash}
                            />
                            <g className="hmi-needle" style={{ transform: `rotate(${needleAngle}deg)` }}>
                              <line x1="150" y1="150" x2="150" y2="56" />
                              <circle cx="150" cy="150" r="8" />
                            </g>
                          </svg>

                          <div className="hmi-gauge-readout">
                            <div className="hmi-speed">{activeCluster.main}</div>
                            <div className="hmi-unit">{activeCluster.unit}</div>
                            <div className="hmi-gear-row">
                              {['CGPA', 'BUDGET', 'TASKS', 'UMS'].map((mode) => (
                                <button
                                  key={mode}
                                  type="button"
                                  className={`hmi-gear ${hmiClusterMode === mode ? 'active' : ''}`}
                                  onClick={() => setHmiClusterMode(mode)}
                                >
                                  {mode}
                                </button>
                              ))}
                            </div>
                            <div className="hmi-mode-chip">MODE • {hmiClusterMode}</div>
                          </div>
                        </div>

                        <div className="hmi-battery" title="Task Completion">
                          <svg viewBox="0 0 80 80">
                            <circle className="hmi-ring-track" cx="40" cy="40" r="32" />
                            <circle
                              className="hmi-ring-value"
                              cx="40"
                              cy="40"
                              r="32"
                              transform="rotate(-90 40 40)"
                              strokeDasharray={ringDash}
                            />
                          </svg>
                          <div className="hmi-battery-text">
                            <strong>{taskCompletionPercent}%</strong>
                            <span>TASKS</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Glass Panel */}
                      <div className="hmi-panel hmi-panel-right hmi-glass">
                        <h4 className="hmi-panel-title">Live Status</h4>

                        <ul className="hmi-status-list">
                          <li><span>Balance</span><b>৳ {currentBalance}</b></li>
                          <li><span>Budget Cap</span><b>৳ {budgetLimit}</b></li>
                          <li><span>Courses</span><b>{coursesCount} Active</b></li>
                          <li><span>Tasks Done</span><b>{completedTasksCount}/{tasks.length}</b></li>
                        </ul>

                        <div className="hmi-next-turn" onClick={handleOpenUms} title="Launch UMS Portal">
                          <span className="hmi-turn-arrow">↗</span>
                          <div>
                            <strong>UMS PORTAL</strong>
                            <span>{user?.student_id || 'Student Account'}</span>
                          </div>
                        </div>

                        <div className="hmi-now-playing">
                          <span>◉</span>
                          <span>{notices[0]?.title || 'Academic Sync Ready'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom 6-Card Control Strip */}
                    <div className="hmi-strip hmi-glass">
                      {[
                        { id: 'cgpa', icon: '📈', label: 'CGPA', summary: `${cgpaData.cgpa} / 4.00` },
                        { id: 'budget', icon: '💰', label: 'Budget', summary: `৳ ${currentBalance}` },
                        { id: 'ums', icon: '⚡', label: 'UMS Pass', summary: 'Open Portal' },
                        { id: 'courses', icon: '📚', label: 'Courses', summary: `${coursesCount} Enrolled` },
                        { id: 'tasks', icon: '📝', label: 'Tasks', summary: `${completedTasksCount}/${tasks.length} Done` },
                        { id: 'status', icon: '◈', label: 'Inspector', summary: `${hmiClusterMode} View` }
                      ].map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          style={{ '--i': idx }}
                          className={`hmi-card ${hmiActiveModal === item.id ? 'is-active' : ''}`}
                          onMouseMove={handleHmiCardMove}
                          onMouseLeave={handleHmiCardLeave}
                          onClick={() => setHmiActiveModal(item.id)}
                        >
                          <span className="hmi-card-shine" />
                          <span className="hmi-card-icon">{item.icon}</span>
                          <span className="hmi-card-label">{item.label}</span>
                          <span className="hmi-card-summary">{item.summary}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interactive Modal Overlay inside 3D HMI Root */}
                {hmiActiveModal && (
                  <div className="hmi-overlay" onClick={() => setHmiActiveModal(null)}>
                    <div className="hmi-modal hmi-glass" onClick={(e) => e.stopPropagation()}>
                      <div className="hmi-modal-head">
                        <div className="hmi-modal-title">
                          <span>◈</span>
                          <h2>HMI Control • {hmiActiveModal.toUpperCase()}</h2>
                        </div>
                        <button type="button" className="hmi-close" onClick={() => setHmiActiveModal(null)}>
                          ✕
                        </button>
                      </div>

                      <div className="hmi-modal-body">
                        <p className="hmi-hint">
                          Current CGPA: <b>{cgpaData.cgpa}</b> ({cgpaData.totalCredits} Credits) • Balance: <b>৳ {currentBalance}</b> • Budget Used: <b>{budgetUsedPercent}%</b>
                        </p>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="hmi-action-btn"
                            onClick={() => {
                              const nextVal = ((parseFloat(monthlyBudget.budget) || 10000) + 1000);
                              handleUpdateBudget({ ...monthlyBudget, budget: nextVal });
                              showToast(`বাজেট বাড়িয়ে ৳ ${nextVal} করা হয়েছে!`);
                            }}
                          >
                            + ৳1,000 Budget
                          </button>

                          <button
                            type="button"
                            className="hmi-action-btn"
                            onClick={() => {
                              const targetTab =
                                hmiActiveModal === 'cgpa' ? 'cgpa'
                                : hmiActiveModal === 'budget' ? 'expenses'
                                : hmiActiveModal === 'courses' ? 'courses'
                                : 'dashboard';
                              setHmiActiveModal(null);
                              if (targetTab !== 'dashboard') changeTab(targetTab);
                            }}
                          >
                            Open Full Module →
                          </button>

                          {hmiActiveModal === 'ums' && (
                            <button
                              type="button"
                              className="hmi-action-btn"
                              onClick={() => {
                                setHmiActiveModal(null);
                                handleOpenUms();
                              }}
                            >
                              Launch UMS Now ↗
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clickable Summary Cards with Orange Glow */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                <div onClick={() => changeTab('cgpa')} className="card-hover" style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #f97316' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>CURRENT CGPA (Click to View)</span>
                  <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: t.text }}>{cgpaData.cgpa} <span style={{ fontSize: '14px', color: t.subText }}>/ 4.00</span></h3>
                </div>

                <div onClick={() => changeTab('expenses')} className="card-hover" style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #10b981' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>THIS MONTH BALANCE (Click to Track)</span>
                  <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#10b981' }}>৳ {currentBalance}</h3>
                </div>

                <div onClick={() => changeTab('expenses')} className="card-hover" style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #f97316' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>BUDGET USED</span>
                  <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#f97316' }}>{budgetUsedPercent}%</h3>
                </div>

                <div onClick={() => changeTab('courses')} className="card-hover" style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #ef4444' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>TOTAL COURSES (Click to Manage)</span>
                  <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#ef4444' }}>{coursesCount}</h3>
                </div>

              </div>

              {/* MODULES: Daily Tasks & SEU Official Academic Calendar with Orange Theme & High-Level Animations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Module 1: Daily Study & Coding Task Manager */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ background: t.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${t.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: t.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📝</span> Today's Study & Coding Tasks
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="Add new task..." 
                      value={newTaskText} 
                      onChange={e => setNewTaskText(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#f97316'}
                      onBlur={(e) => e.target.style.borderColor = t.border}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if(!newTaskText.trim()) return;
                        setTasks([{ id: Date.now(), text: newTaskText, completed: false }, ...tasks]);
                        setNewTaskText('');
                        showToast('Task added successfully!');
                      }}
                      style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}
                    >
                      Add
                    </motion.button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                    <AnimatePresence>
                      {tasks.map(task => (
                        <motion.div 
                          key={task.id}
                          layout
                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 50, scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: t.bg, borderRadius: '10px', border: `1px solid ${t.border}` }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                              type="checkbox" 
                              checked={task.completed} 
                              onChange={() => {
                                setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                              }}
                              style={{ cursor: 'pointer', accentColor: '#f97316', width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '13px', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? t.subText : t.text, transition: 'color 0.2s' }}>
                              {task.text}
                            </span>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.2, color: '#ef4444' }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                            style={{ background: 'none', border: 'none', color: t.subText, cursor: 'pointer', fontSize: '15px', padding: '4px' }}
                          >
                            ✕
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Module 2: SEU Official Academic Calendar & Deadlines */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  style={{ background: t.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${t.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: t.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📅</span> SEU Academic Calendar (Dec - Feb)
                    </h3>
                  </div>

                  {/* Add Custom Notice Input */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexDirection: 'column' }}>
                    <input 
                      type="text" 
                      placeholder="Event Title (e.g. Extra Class)" 
                      value={newNoticeTitle} 
                      onChange={e => setNewNoticeTitle(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '12px', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = '#f97316'}
                      onBlur={(e) => e.target.style.borderColor = t.border}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Date (e.g. Dec 10, 2026)" 
                        value={newNoticeDate} 
                        onChange={e => setNewNoticeDate(e.target.value)}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '12px', outline: 'none' }}
                        onFocus={(e) => e.target.style.borderColor = '#f97316'}
                        onBlur={(e) => e.target.style.borderColor = t.border}
                      />
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if(!newNoticeTitle.trim() || !newNoticeDate.trim()) return;
                          setNotices([{ id: Date.now(), title: newNoticeTitle, date: newNoticeDate }, ...notices]);
                          setNewNoticeTitle('');
                          setNewNoticeDate('');
                          showToast('Academic event added!');
                        }}
                        style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}
                      >
                        Add Event
                      </motion.button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '190px', overflowY: 'auto', paddingRight: '4px' }}>
                    <AnimatePresence>
                      {notices.map(notice => (
                        <motion.div 
                          key={notice.id}
                          layout
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: t.bg, borderRadius: '10px', borderLeft: '4px solid #f97316', border: `1px solid ${t.border}` }}
                        >
                          <div>
                            <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: t.text, fontWeight: '600' }}>{notice.title}</h4>
                            <p style={{ margin: 0, fontSize: '11px', color: t.subText }}>{notice.date}</p>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.2, color: '#ef4444' }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => setNotices(notices.filter(n => n.id !== notice.id))}
                            style={{ background: 'none', border: 'none', color: t.subText, cursor: 'pointer', fontSize: '13px', padding: '4px' }}
                          >
                            ✕
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>

              </div>

            </motion.div>
          )}

          {/* 2. EXPENSES */}
          {activeTab === 'expenses' && (
            <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <h2 style={{ color: t.text, marginBottom: '20px', fontSize: '20px' }}>💰 Expense & Budget Tracker</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Left Column: Manual Budget/Balance & Add Transaction Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Manual Budget & Balance Update Box */}
                  <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>Manage Budget & Initial Balance</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const bVal = e.target.budgetInput.value;
                      const balVal = e.target.balanceInput.value;
                      handleUpdateBudget({ budget: bVal || 10000, initialBalance: balVal || 0 });
                      showToast('বাজেট এবং ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!');
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label style={{ fontSize: '12px', color: t.subText }}>Monthly Budget Limit (Tk)</label>
                      <input type="number" name="budgetInput" defaultValue={monthlyBudget.budget} placeholder="Monthly Budget (e.g. 10000)" style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} required />
                      
                      <label style={{ fontSize: '12px', color: t.subText }}>Initial / Starting Cash Balance (Tk)</label>
                      <input type="number" name="balanceInput" defaultValue={monthlyBudget.initialBalance} placeholder="Initial Balance (e.g. 5000)" style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      
                      <button type="submit" style={{ padding: '10px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Settings</button>
                    </form>
                  </div>

                  {/* Add New Transaction Box */}
                  <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>Add New Transaction</h3>
                    <form onSubmit={handleAddTxn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <select value={txnForm.type} onChange={e => setTxnForm({ ...txnForm, type: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                      <input type="text" placeholder="Category (e.g. Food, Tuition)" value={txnForm.category} onChange={e => setTxnForm({ ...txnForm, category: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <input type="number" placeholder="Amount (Tk)" value={txnForm.amount} onChange={e => setTxnForm({ ...txnForm, amount: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <button type="submit" style={{ padding: '12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Transaction</button>
                    </form>
                  </div>

                </div>

                {/* Right Column: Recent Transactions Table */}
                <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', color: t.text }}>Recent Transactions</h3>
                    <span style={{ fontSize: '13px', color: t.subText }}>Current Balance: <strong style={{ color: '#10b981' }}>৳ {currentBalance}</strong></span>
                  </div>
                  {transactions.length === 0 ? <p style={{ color: t.subText, textAlign: 'center', marginTop: '100px' }}>No transactions added yet.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: t.text }}>
                      <thead><tr style={{ background: t.bg, textAlign: 'left', color: t.subText }}><th style={{ padding: '10px' }}>Type</th><th style={{ padding: '10px' }}>Category</th><th style={{ padding: '10px' }}>Amount</th><th style={{ padding: '10px' }}>Date</th></tr></thead>
                      <tbody>
                        {transactions.map(tr => (
                          <tr key={tr.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                            <td style={{ padding: '10px', color: tr.type === 'income' ? '#10b981' : '#ef4444', fontWeight: '600' }}>{tr.type}</td>
                            <td style={{ padding: '10px' }}>{tr.category}</td>
                            <td style={{ padding: '10px' }}>৳ {tr.amount}</td>
                            <td style={{ padding: '10px', color: t.subText, fontSize: '13px' }}>{tr.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* 3. CGPA */}
          {activeTab === 'cgpa' && (
            <motion.div key="cgpa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <h2 style={{ color: t.text, marginBottom: '20px', fontSize: '20px' }}>📈 CGPA & Target Planner</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Manual CGPA Update Box */}
                  <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>Update Current CGPA</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const newCgpaVal = e.target.manualCgpa.value;
                      const newCredVal = e.target.manualCredits.value;
                      if(newCgpaVal) {
                        handleUpdateCgpa({ cgpa: newCgpaVal, totalCredits: newCredVal || cgpaData.totalCredits });
                        showToast('সিজিপিএ সফলভাবে আপডেট করা হয়েছে!');
                      }
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <input type="number" step="0.01" name="manualCgpa" defaultValue={cgpaData.cgpa} placeholder="Current CGPA (e.g. 3.17)" style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} required />
                      <input type="number" name="manualCredits" defaultValue={cgpaData.totalCredits} placeholder="Completed Credits (e.g. 90)" style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <button type="submit" style={{ padding: '10px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save CGPA</button>
                    </form>
                  </div>

                  {/* Target CGPA Planner Box */}
                  <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>Target CGPA Planner</h3>
                    <form onSubmit={handleCalculateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: t.subText }}>Current CGPA: <strong style={{ color: t.text }}>{cgpaData.cgpa}</strong> (Completed Credits: {cgpaData.totalCredits})</p>
                      <input type="number" step="0.01" placeholder="Desired Target CGPA (e.g. 3.40)" value={targetCgpa} onChange={e => setTargetCgpa(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <input type="number" placeholder="Next Semester Credits (e.g. 15)" value={nextCredits} onChange={e => setNextCredits(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <button type="submit" style={{ padding: '12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Calculate Required GPA</button>
                    </form>
                    {requiredGpa && <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.3)' }}><h4 style={{ margin: 0, color: '#f97316' }}>Required Next GPA: {requiredGpa}</h4></div>}
                  </div>

                </div>

                <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>SEU Grading Scale</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: t.text }}>
                    <thead><tr style={{ background: t.bg, textAlign: 'left', color: t.subText }}><th style={{ padding: '8px' }}>Marks</th><th style={{ padding: '8px' }}>Grade</th><th style={{ padding: '8px' }}>Point</th></tr></thead>
                    <tbody>
                      {[['80%+', 'A+', '4.00'], ['75%-79%', 'A', '3.75'], ['70%-74%', 'A-', '3.50'], ['65%-69%', 'B+', '3.25'], ['60%-64%', 'B', '3.00']].map(([m, g, p], idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${t.border}` }}><td style={{ padding: '8px' }}>{m}</td><td style={{ padding: '8px', fontWeight: '600', color: '#f97316' }}>{g}</td><td style={{ padding: '8px' }}>{p}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. HOUSE & BILLS (MESS MANAGEMENT) */}
          {activeTab === 'attendance' && (
            <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <h2 style={{ color: t.text, marginBottom: '20px', fontSize: '20px' }}>🏠 House & Bills — Mess Management (৩৫ দিনের শিট)</h2>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: t.cardBg, padding: '16px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #f97316' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>মোট বাজার খরচ</span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', color: t.text }}>৳ {messTotalBazaar.toFixed(2)}</h3>
                </div>
                <div style={{ background: t.cardBg, padding: '16px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #10b981' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>৩৫ দিনের মোট মিল</span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', color: '#10b981' }}>{messGrandTotalMeals}</h3>
                </div>
                <div style={{ background: t.cardBg, padding: '16px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #f97316' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>মিল রেট (বাজার ÷ মিল)</span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', color: '#f97316' }}>৳ {messMealRate.toFixed(2)}</h3>
                </div>
                <div style={{ background: t.cardBg, padding: '16px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #ef4444' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>মোট ইউটিলিটি বিল</span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', color: '#ef4444' }}>৳ {messTotalUtilityBills.toFixed(2)}</h3>
                </div>
              </div>

              {/* ১. ৫ জন মেম্বারের নাম সেটআপ */}
              <div style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: t.text }}>👥 ৫ জন সদস্যের নাম (লিখলে ডাটাবেজ ও লোকাল স্টোরেজে সেভ থাকবে)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {messMembers.map((m, idx) => (
                    <div key={m.id}>
                      <label style={{ fontSize: '12px', color: t.subText }}>মেম্বার #{idx + 1}</label>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleMessMemberField(m.id, 'name', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, marginTop: '4px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ২. সাপ্তাহিক খাবারের মেনু ও নিয়মাবলি */}
              <div style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: t.text }}>🍽️ সাপ্তাহিক খাবারের মেনু (এডিটেবল)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: t.text }}>
                    <thead>
                      <tr style={{ background: t.bg, textAlign: 'left', color: t.subText }}>
                        <th style={{ padding: '10px' }}>বার</th>
                        <th style={{ padding: '10px' }}>সকাল</th>
                        <th style={{ padding: '10px' }}>রাত</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messWeeklyMenu.map((item, idx) => (
                        <tr key={item.day} style={{ borderBottom: `1px solid ${t.border}` }}>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: '#f97316' }}>{item.day}</td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              value={item.morning}
                              onChange={(e) => handleMessMenuField(idx, 'morning', e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              value={item.night}
                              onChange={(e) => handleMessMenuField(idx, 'night', e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '14px', padding: '12px 16px', background: t.bg, borderRadius: '10px', border: `1px solid ${t.border}`, fontSize: '12px', color: t.subText }}>
                  <strong style={{ color: t.text }}>দ্রষ্টব্য:</strong>
                  <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                    {messRules.map((rule, rIdx) => (
                      <li key={rIdx} style={{ marginBottom: '4px' }}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ৩. মাসকে ৫ ধাপে ভাগ করে বাজারের ফিল্ড + তারিখ অনুযায়ী টাকা ও বিবরণ */}
              <div style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: t.text }}>🛒 ৫ ধাপের বাজার শিডিউল ও বাজারের টাকা (তারিখ অনুযায়ী টাকা ও বিবরণ যুক্ত করা যাবে)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: t.text }}>
                    <thead>
                      <tr style={{ background: t.bg, textAlign: 'left', color: t.subText }}>
                        <th style={{ padding: '10px' }}>ধাপ</th>
                        <th style={{ padding: '10px' }}>তারিখের রেঞ্জ</th>
                        <th style={{ padding: '10px' }}>বাজার করবে</th>
                        <th style={{ padding: '10px' }}>বাজারের টাকা (৳)</th>
                        <th style={{ padding: '10px' }}>বাজার বিবরণ ও তারিখ অনুযায়ী এন্ট্রি</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messBazaarPhases.map((phase) => {
                        const entries = Array.isArray(phase.dateEntries) && phase.dateEntries.length > 0
                          ? phase.dateEntries
                          : [{ id: phase.phaseNumber * 100 + 1, date: '', amount: phase.amount || 0, note: phase.note || '' }];

                        return (
                          <tr key={phase.phaseNumber} style={{ borderBottom: `1px solid ${t.border}`, verticalAlign: 'top' }}>
                            <td style={{ padding: '10px', fontWeight: '700' }}>{phase.phaseLabel}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                type="text"
                                value={phase.dateRange}
                                onChange={(e) => handleMessPhaseField(phase.phaseNumber, 'dateRange', e.target.value)}
                                style={{ width: '130px', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}
                              />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <select
                                value={phase.memberId || ''}
                                onChange={(e) => handleMessPhaseField(phase.phaseNumber, 'memberId', e.target.value)}
                                style={{ padding: '7px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}
                              >
                                {messMembers.map((m) => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={phase.amount === 0 ? '' : phase.amount}
                                placeholder="0"
                                onChange={(e) => handleMessPhaseField(phase.phaseNumber, 'amount', e.target.value)}
                                style={{ width: '115px', padding: '7px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: '#f97316', fontWeight: '600' }}
                              />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {entries.map((entry) => (
                                  <div key={entry.id} style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                      type="text"
                                      value={entry.date || ''}
                                      placeholder="তারিখ (যেমন: 2026-11-03 বা ৩ তারিখ)"
                                      onChange={(e) => handlePhaseDateEntryChange(phase.phaseNumber, entry.id, 'date', e.target.value)}
                                      style={{ width: '155px', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '12px' }}
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={entry.amount === 0 ? '' : entry.amount}
                                      placeholder="৳ টাকা"
                                      onChange={(e) => handlePhaseDateEntryChange(phase.phaseNumber, entry.id, 'amount', e.target.value)}
                                      style={{ width: '95px', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: '#10b981', fontWeight: '600', fontSize: '12px' }}
                                    />
                                    <input
                                      type="text"
                                      value={entry.note || ''}
                                      placeholder="বাজার বিবরণ (যেমন: চাল, তেল, মাছ...)"
                                      onChange={(e) => handlePhaseDateEntryChange(phase.phaseNumber, entry.id, 'note', e.target.value)}
                                      style={{ flex: 1, minWidth: '160px', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '12px' }}
                                    />
                                    {entries.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePhaseDateEntry(phase.phaseNumber, entry.id)}
                                        style={{ padding: '5px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handleAddPhaseDateEntry(phase.phaseNumber)}
                                    style={{ padding: '5px 10px', background: 'rgba(249, 115, 22, 0.16)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                                  >
                                    + তারিখের বাজার যোগ করুন
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* বাজারের লিস্ট নোট (Bazaar List Note) */}
                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: t.bg, border: `1px solid ${t.border}` }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#f97316' }}>📝 বাজারের লিস্ট নোট (তারিখ অনুযায়ী নোট করে রাখুন)</h4>
                  <form onSubmit={handleAddBazaarNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={newBazaarNoteDate}
                        onChange={(e) => setNewBazaarNoteDate(e.target.value)}
                        placeholder="তারিখ (যেমন: 2026-11-20)"
                        style={{ width: '160px', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.cardBg, color: t.text, fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        value={newBazaarNoteTitle}
                        onChange={(e) => setNewBazaarNoteTitle(e.target.value)}
                        placeholder="নোটের শিরোনাম (যেমন: ৩ তারিখের বাজার লিস্ট)"
                        style={{ flex: 1, minWidth: '200px', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.cardBg, color: t.text, fontSize: '12px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={newBazaarNoteItems}
                        onChange={(e) => setNewBazaarNoteItems(e.target.value)}
                        placeholder="বাজারের লিস্ট লিখুন (যেমন: চাল ৫ কেজি, ডিম ৩০টা, আলু ৩ কেজি, সয়াবিন তেল ২ লিটার...)"
                        style={{ flex: 1, minWidth: '240px', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.cardBg, color: t.text, fontSize: '12px' }}
                      />
                      <button
                        type="submit"
                        style={{ padding: '8px 14px', borderRadius: '6px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                      >
                        + নোট সেভ করুন
                      </button>
                    </div>
                  </form>

                  {messBazaarNotes.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: t.subText }}>এখনো কোনো বাজারের লিস্ট নোট যুক্ত করা হয়নি।</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                      {messBazaarNotes.map((noteItem) => (
                        <div key={noteItem.id} style={{ padding: '12px', borderRadius: '8px', background: t.cardBg, border: `1px solid ${t.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>
                              📅 {noteItem.date} {noteItem.weekday ? `(${noteItem.weekday})` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteBazaarNote(noteItem.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                            >
                              ✕
                            </button>
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '4px' }}>{noteItem.title}</div>
                          <div style={{ fontSize: '12px', color: t.subText, whiteSpace: 'pre-wrap' }}>{noteItem.items}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ৪. ৩৫ দিনের ডেইলি মিল কাউন্টিং শিট (রিয়েল ক্যালেন্ডার অনুযায়ী তারিখ ও অটো বার) */}
              <div style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: t.text }}>📅 ৩৫ দিনের ডেইলি মিল কাউন্টিং শিট (রিয়েল ক্যালেন্ডার অনুযায়ী তারিখ ও অটো বার)</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '12px', color: t.subText }}>শুরুর ক্যালেন্ডার তারিখ:</label>
                    <input
                      type="text"
                      value={messStartDate}
                      onChange={(e) => handleMessStartDateChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') applyCalendarStartDate(e.currentTarget.value);
                      }}
                      placeholder="YYYY-MM-DD (যেমন: 2026-11-20)"
                      style={{ width: '145px', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={() => applyCalendarStartDate(messStartDate)}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      বার আপডেট
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: t.text }}>
                    <thead style={{ position: 'sticky', top: 0, background: t.bg, zIndex: 1 }}>
                      <tr style={{ textAlign: 'left', color: t.subText }}>
                        <th style={{ padding: '10px' }}>দিন ও ক্যালেন্ডার তারিখ</th>
                        <th style={{ padding: '10px' }}>বার</th>
                        <th style={{ padding: '10px' }}>সকাল ও রাতের মেনু</th>
                        {messMembers.map((m) => (
                          <th key={m.id} style={{ padding: '10px', textAlign: 'center' }}>{m.name}</th>
                        ))}
                        <th style={{ padding: '10px', textAlign: 'center' }}>দিনের মিল</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messMealSheet35.map((row) => {
                        const daySum = messMembers.reduce(
                          (acc, m) => acc + (parseFloat(row.mealsByMember?.[m.id]) || 0),
                          0
                        );
                        return (
                          <tr key={row.day} style={{ borderBottom: `1px solid ${t.border}` }}>
                            <td style={{ padding: '6px 10px', fontWeight: '700' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span>দিন {row.day}</span>
                                <input
                                  type="text"
                                  value={row.calendarDate || ''}
                                  onChange={(e) => handleMessRowDateChange(row.day, e.target.value)}
                                  placeholder="YYYY-MM-DD"
                                  style={{ width: '112px', padding: '4px 6px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '11px' }}
                                />
                              </div>
                            </td>
                            <td style={{ padding: '6px 10px', fontWeight: '700', color: '#f97316' }}>{row.weekday}</td>
                            <td style={{ padding: '6px 10px', color: t.subText, fontSize: '12px' }}>
                              সকাল: {row.morningMenu} | রাত: {row.nightMenu}
                            </td>
                            {messMembers.map((m) => (
                              <td key={m.id} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={row.mealsByMember?.[m.id] === 0 ? '' : row.mealsByMember?.[m.id]}
                                  placeholder="0"
                                  onChange={(e) => handleMessMealCell(row.day, m.id, e.target.value)}
                                  style={{ width: '64px', padding: '6px', textAlign: 'center', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}
                                />
                              </td>
                            ))}
                            <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: '700', color: '#f97316' }}>
                              {daySum}
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: t.bg, fontWeight: '700' }}>
                        <td colSpan={3} style={{ padding: '10px', textAlign: 'right' }}>মোট মিল (৩৫ দিন):</td>
                        {messMembers.map((m) => (
                          <td key={m.id} style={{ padding: '10px', textAlign: 'center', color: '#10b981' }}>
                            {messMemberMealsMap[m.id] || 0}
                          </td>
                        ))}
                        <td style={{ padding: '10px', textAlign: 'center', color: '#f97316' }}>{messGrandTotalMeals}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ৫. এডিটেবল ইউটিলিটি / এক্সট্রা বিলসমূহ */}
              <div style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: t.text }}>💡 ইউটিলিটি / এক্সট্রা বিল (বুয়া, বাসা খরচ, ওয়াইফাই ইত্যাদি)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  {messUtilityBills.map((bill) => (
                    <div key={bill.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: t.bg, padding: '10px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
                      <input
                        type="text"
                        value={bill.name}
                        onChange={(e) => handleMessBillChange(bill.id, 'name', e.target.value)}
                        style={{ flex: 1, padding: '7px 9px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.cardBg, color: t.text }}
                      />
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={bill.amount === 0 ? '' : bill.amount}
                        placeholder="৳"
                        onChange={(e) => handleMessBillChange(bill.id, 'amount', e.target.value)}
                        style={{ width: '90px', padding: '7px 9px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.cardBg, color: '#f97316', fontWeight: '600' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteMessBill(bill.id)}
                        style={{ padding: '7px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddMessBill} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="নতুন বিলের নাম (যেমন: ময়লা বিল, কারেন্ট)"
                    value={newMessBillTitle}
                    onChange={(e) => setNewMessBillTitle(e.target.value)}
                    style={{ padding: '9px 12px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="টাকার পরিমাণ"
                    value={newMessBillAmount}
                    onChange={(e) => setNewMessBillAmount(e.target.value)}
                    style={{ width: '140px', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}
                  />
                  <button
                    type="submit"
                    style={{ padding: '9px 16px', borderRadius: '8px', background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                  >
                    + বিল যোগ করুন
                  </button>
                </form>
              </div>

              {/* ৬. ফাইনাল সেটেলমেন্ট (মিল খরচ + ইউটিলিটি বিল শেয়ার + এক্সট্রা অ্যাড-অন ফিল্ড) */}
              <div style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: t.text }}>📊 ফাইনাল পাওয়া-দেওয়ার হিসাব (মিল + ইউটিলিটি + অতিরিক্ত অ্যাড-অন)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: t.text }}>
                    <thead>
                      <tr style={{ background: t.bg, textAlign: 'left', color: t.subText }}>
                        <th style={{ padding: '10px' }}>সদস্য</th>
                        <th style={{ padding: '10px' }}>মোট মিল</th>
                        <th style={{ padding: '10px' }}>মিল খরচ (৳)</th>
                        <th style={{ padding: '10px' }}>ইউটিলিটি শেয়ার (৳)</th>
                        <th style={{ padding: '10px' }}>অতিরিক্ত অ্যাড-অন (৳)</th>
                        <th style={{ padding: '10px' }}>অ্যাড-অন বিবরণ</th>
                        <th style={{ padding: '10px' }}>মোট বাজার/জমা (৳)</th>
                        <th style={{ padding: '10px' }}>সর্বমোট খরচ (৳)</th>
                        <th style={{ padding: '10px' }}>ফাইনাল হিসাব</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messSettlements.map((s) => {
                        const isPositive = s.netBalance >= 0;
                        return (
                          <tr key={s.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                            <td style={{ padding: '8px 10px', fontWeight: '700' }}>{s.name}</td>
                            <td style={{ padding: '8px 10px' }}>{s.totalMeals}</td>
                            <td style={{ padding: '8px 10px' }}>৳ {s.mealCost.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px' }}>৳ {s.utilityShare.toFixed(2)}</td>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={s.extraAddOn === 0 ? '' : s.extraAddOn}
                                placeholder="0"
                                onChange={(e) => handleMessMemberField(s.id, 'extraAddOn', e.target.value)}
                                style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: '#f97316', fontWeight: '600' }}
                              />
                            </td>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="text"
                                value={s.extraNote}
                                placeholder="কী কেনা হয়েছে..."
                                onChange={(e) => handleMessMemberField(s.id, 'extraNote', e.target.value)}
                                style={{ width: '140px', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}
                              />
                            </td>
                            <td style={{ padding: '8px 10px', color: '#10b981', fontWeight: '600' }}>৳ {s.totalPaidOrDeposited.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px' }}>৳ {s.totalExpenseForMember.toFixed(2)}</td>
                            <td
                              style={{
                                padding: '8px 10px',
                                fontWeight: '700',
                                color: Math.abs(s.netBalance) < 0.01 ? t.subText : isPositive ? '#10b981' : '#ef4444'
                              }}
                            >
                              {Math.abs(s.netBalance) < 0.01
                                ? 'সমান (৳0.00)'
                                : isPositive
                                ? `পাবে +৳${s.netBalance.toFixed(2)}`
                                : `দেবে -৳${Math.abs(s.netBalance).toFixed(2)}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. COURSES */}
          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <Courses
                token={token}
                user={user}
                onCoursesChange={() => fetchUserCoursesCount(token)}
              />
            </motion.div>
          )}

          {/* 6. CHATBOT */}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <AiChatbot
                apiBase={API_BASE}
                token={token}
                user={user}
                theme={theme}
                contextStats={{
                  cgpa: cgpaData.cgpa,
                  totalCredits: cgpaData.totalCredits,
                  currentBalance,
                  budgetLimit,
                  budgetUsedPercent,
                  coursesCount
                }}
                onShowToast={showToast}
              />
            </motion.div>
          )}

          {/* 7. LEARNING HUB */}
          {activeTab === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <h2 style={{ color: t.text, marginBottom: '20px', fontSize: '20px' }}>💡 Learning Hub</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {HUB_TOPICS.map((topic, idx) => (
                  <div key={idx} style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <span style={{ fontSize: '32px' }}>{topic.icon}</span>
                    <h3 style={{ margin: '12px 0 6px 0', color: t.text, fontSize: '17px' }}>{topic.title}</h3>
                    <p style={{ color: t.subText, fontSize: '13px', margin: '0 0 16px 0' }}>{topic.desc}</p>
                    <h4 style={{ fontSize: '12px', color: t.subText, textTransform: 'uppercase', marginBottom: '8px' }}>Lessons List</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#f97316', fontSize: '13px', cursor: 'pointer' }}>
                      {topic.lessons.map((les, lIdx) => (
                        <li
                          key={lIdx}
                          onClick={() => handleSelectHubLesson(topic.title, les)}
                          style={{
                            marginBottom: '6px',
                            fontWeight: activeLesson?.title === les.title ? '700' : '400',
                            textDecoration: activeLesson?.title === les.title ? 'underline' : 'none'
                          }}
                        >
                          {les.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {activeLesson && (
                <div style={{ marginTop: '30px', background: t.cardBg, padding: '24px', borderRadius: '14px', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#f97316', fontSize: '16px' }}>
                      📖 Active Lesson: {activeLesson.courseTitle} — {activeLesson.title}
                    </h3>
                    <button
                      onClick={() => setActiveLesson(null)}
                      style={{ padding: '6px 14px', background: t.border, color: t.text, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Close Lesson
                    </button>
                  </div>

                  <p style={{ color: t.subText, lineHeight: '1.6', fontSize: '14px', marginTop: '10px' }}>
                    নিচের রিসোর্স লিংকগুলো থেকে বিস্তারিত পড়ো এবং নিচ থেকে প্রতিবার নতুন কুইজ তৈরি করে অনুশীলন করো:
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                    {(activeLesson.resources || []).map((resItem) => (
                      <a
                        key={resItem.url}
                        href={resItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: t.bg,
                          color: '#60a5fa',
                          textDecoration: 'none',
                          fontSize: '13px',
                          border: `1px solid ${t.border}`
                        }}
                      >
                        {resItem.label} ↗
                      </a>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={loadingQuiz}
                      onClick={() => handleGenerateHubQuiz(10)}
                      style={{
                        padding: '10px 18px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {loadingQuiz ? 'নতুন প্রশ্ন তৈরি হচ্ছে...' : 'Generate New Quiz (10 Questions)'}
                    </button>

                    {quizQuestions.length > 0 && !quizSubmitted && (
                      <button
                        type="button"
                        onClick={() => setQuizSubmitted(true)}
                        style={{
                          padding: '10px 18px',
                          background: t.bg,
                          color: t.text,
                          border: `1px solid ${t.border}`,
                          borderRadius: `/8px`,
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Submit Quiz
                      </button>
                    )}
                  </div>

                  {quizSourceNote && (
                    <p style={{ color: '#fbbf24', fontSize: '12px', marginTop: '10px' }}>{quizSourceNote}</p>
                  )}

                  {quizError && (
                    <p style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>{quizError}</p>
                  )}

                  {quizSubmitted && quizQuestions.length > 0 && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.14)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#10b981', fontWeight: '600', fontSize: '14px' }}>
                      Score: {hubQuizScore} / {quizQuestions.length} — আরও ভিন্ন প্রশ্ন পেতে "Generate New Quiz" চাপো।
                    </div>
                  )}

                  {quizQuestions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      style={{
                        marginTop: '14px',
                        paddingTop: '14px',
                        borderTop: `1px solid ${t.border}`
                      }}
                    >
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px', color: t.text }}>
                        {qIdx + 1}. {q.question}
                      </p>
                      <div style={{ display: 'grid', gap: '6px' }}>
                        {(q.options || []).map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '13px',
                              color: t.text,
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="radio"
                              name={`hub-q-${qIdx}`}
                              checked={selectedAnswers[qIdx] === oIdx}
                              onChange={() =>
                                setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                              }
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      {quizSubmitted && q.explanation && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#60a5fa' }}>
                          ব্যাখ্যা: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;