export const LEARNING_HUB_DATA = [
  {
    courseId: 'cpp',
    title: 'C++ Programming',
    subtitle: 'Pointers, Memory, OOP Basics',
    lessons: [
      {
        id: 'cpp-hello-io',
        title: 'Hello World & I/O',
        resources: [
          { label: 'W3Schools C++ I/O', url: 'https://www.w3schools.com/cpp/cpp_user_input.asp' },
          { label: 'GeeksforGeeks C++ Basic I/O', url: 'https://www.geeksforgeeks.org/basic-input-output-c/' },
          { label: 'cppreference I/O Streams', url: 'https://en.cppreference.com/w/cpp/io' }
        ]
      },
      {
        id: 'cpp-pointers-ref',
        title: 'Pointers & References',
        resources: [
          { label: 'W3Schools C++ Pointers', url: 'https://www.w3schools.com/cpp/cpp_pointers.asp' },
          { label: 'W3Schools C++ References', url: 'https://www.w3schools.com/cpp/cpp_references.asp' },
          { label: 'LearnCpp Pointers & References', url: 'https://www.learncpp.com/' }
        ]
      },
      {
        id: 'cpp-oop',
        title: 'OOP Concepts',
        resources: [
          { label: 'W3Schools C++ OOP', url: 'https://www.w3schools.com/cpp/cpp_oop.asp' },
          { label: 'GeeksforGeeks OOP in C++', url: 'https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/' }
        ]
      }
    ]
  },
  {
    courseId: 'java-core',
    title: 'Java Core',
    subtitle: 'Classes, Objects, Polymorphism',
    lessons: [
      {
        id: 'java-jvm-main',
        title: 'JVM & Main Method',
        resources: [
          { label: 'GeeksforGeeks JVM Architecture', url: 'https://www.geeksforgeeks.org/jvm-works-jvm-architecture/' },
          { label: 'W3Schools Java Methods', url: 'https://www.w3schools.com/java/java_methods.asp' },
          { label: 'Oracle Java Docs', url: 'https://docs.oracle.com/javase/tutorial/' }
        ]
      },
      {
        id: 'java-inheritance-interfaces',
        title: 'Inheritance & Interfaces',
        resources: [
          { label: 'W3Schools Java Inheritance', url: 'https://www.w3schools.com/java/java_inheritance.asp' },
          { label: 'W3Schools Java Interface', url: 'https://www.w3schools.com/java/java_interface.asp' }
        ]
      },
      {
        id: 'java-exception-handling',
        title: 'Exception Handling',
        resources: [
          { label: 'W3Schools Java Exceptions', url: 'https://www.w3schools.com/java/java_exceptions.asp' },
          { label: 'Baeldung Java Exceptions', url: 'https://www.baeldung.com/java-exceptions' }
        ]
      }
    ]
  },
  {
    courseId: 'mysql-db',
    title: 'MySQL Relational DB',
    subtitle: 'Queries, JOINs & Schema Design',
    lessons: [
      {
        id: 'mysql-crud',
        title: 'Basic CRUD Queries',
        resources: [
          { label: 'W3Schools SQL SELECT/INSERT/UPDATE/DELETE', url: 'https://www.w3schools.com/sql/' },
          { label: 'MySQL Official Documentation', url: 'https://dev.mysql.com/doc/' }
        ]
      },
      {
        id: 'mysql-joins',
        title: 'INNER & LEFT JOINs',
        resources: [
          { label: 'W3Schools SQL JOIN', url: 'https://www.w3schools.com/sql/sql_join.asp' },
          { label: 'MySQL JOIN Syntax', url: 'https://dev.mysql.com/doc/refman/8.4/en/join.html' }
        ]
      },
      {
        id: 'mysql-indexing',
        title: 'Database Indexing',
        resources: [
          { label: 'MySQL Indexes Overview', url: 'https://dev.mysql.com/doc/refman/8.4/en/mysql-indexes.html' },
          { label: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/' }
        ]
      }
    ]
  }
];