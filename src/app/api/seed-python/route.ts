import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const topics = [
  {
    title: "Variables & Data Types",
    content: `# Variables & Data Types\n\nVariables are containers for storing data values. Python has no command for declaring a variable; it is created the moment you first assign a value to it.\n\n## Built-in Data Types\n- **Text Type**: \`str\`\n- **Numeric Types**: \`int\`, \`float\`, \`complex\`\n- **Sequence Types**: \`list\`, \`tuple\`, \`range\`\n- **Mapping Type**: \`dict\`\n- **Set Types**: \`set\`, \`frozenset\`\n- **Boolean Type**: \`bool\`\n\n## Code Example\n\`\`\`python\n# Variables\nx = 5\ny = "Hello, World!"\n\n# Data Types\na = 10          # int\nb = 20.5        # float\nc = ["apple"]   # list\n\`\`\`\n\n> Python is dynamically typed!`
  },
  {
    title: "Operators in Python",
    content: `# Operators in Python\n\nOperators are used to perform operations on variables and values.\n\n## Python divides the operators in the following groups:\n- **Arithmetic operators** (\`+\`, \`-\`, \`*\`, \`/\`, \`//\`, \`%\`, \`**\`)\n- **Assignment operators** (\`=\`, \`+=\`, \`-=\`)\n- **Comparison operators** (\`==\`, \`!=\`, \`>\`, \`<\`)\n- **Logical operators** (\`and\`, \`or\`, \`not\`)\n\n## Code Example\n\`\`\`python\n# Arithmetic\nx = 10 + 5\n\n# Comparison\nis_greater = (10 > 5)\n\n# Logical\nresult = (10 > 5) and (5 < 10)\n\`\`\``
  },
  {
    title: "Control Flow (If-Else)",
    content: `# Control Flow\n\nPython supports the usual logical conditions from mathematics. These conditions can be used in several ways, most commonly in "if statements" and loops.\n\n## Keywords\n- \`if\`\n- \`elif\` (else if)\n- \`else\`\n\n## Code Example\n\`\`\`python\na = 200\nb = 33\n\nif b > a:\n  print("b is greater than a")\nelif a == b:\n  print("a and b are equal")\nelse:\n  print("a is greater than b")\n\`\`\``
  },
  {
    title: "Loops (For & While)",
    content: `# Loops\n\nPython has two primitive loop commands: \`while\` loops and \`for\` loops.\n\n## While Loop\nWith the \`while\` loop we can execute a set of statements as long as a condition is true.\n\n## For Loop\nA \`for\` loop is used for iterating over a sequence (that is either a list, a tuple, a dictionary, a set, or a string).\n\n## Code Example\n\`\`\`python\n# While loop\ni = 1\nwhile i < 6:\n  print(i)\n  i += 1\n\n# For loop\nfruits = ["apple", "banana", "cherry"]\nfor x in fruits:\n  print(x)\n\`\`\``
  },
  {
    title: "Functions",
    content: `# Functions\n\nA function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function. A function can return data as a result.\n\n## Creating and Calling\nIn Python a function is defined using the \`def\` keyword.\n\n## Code Example\n\`\`\`python\ndef my_function(fname):\n  print(fname + " Refsnes")\n\nmy_function("Emil")\nmy_function("Tobias")\nmy_function("Linus")\n\`\`\``
  },
  {
    title: "Lists & Tuples",
    content: `# Lists & Tuples\n\nLists and Tuples are used to store multiple items in a single variable.\n\n## Lists\nLists are created using square brackets. They are ordered, changeable, and allow duplicate values.\n\n## Tuples\nTuples are created using parentheses. They are ordered, unchangeable, and allow duplicate values.\n\n## Code Example\n\`\`\`python\n# List\nmy_list = ["apple", "banana", "cherry"]\nmy_list[0] = "orange"\n\n# Tuple\nmy_tuple = ("apple", "banana", "cherry")\n# my_tuple[0] = "orange"  # This will raise an error\n\`\`\``
  },
  {
    title: "Dictionaries & Sets",
    content: `# Dictionaries & Sets\n\n## Dictionaries\nDictionaries are used to store data values in key:value pairs. A dictionary is a collection which is ordered, changeable and do not allow duplicates.\n\n## Sets\nSets are used to store multiple items in a single variable. A set is a collection which is unordered, unchangeable, and unindexed.\n\n## Code Example\n\`\`\`python\n# Dictionary\nthisdict = {\n  "brand": "Ford",\n  "model": "Mustang",\n  "year": 1964\n}\n\n# Set\nthisset = {"apple", "banana", "cherry"}\n\`\`\``
  },
  {
    title: "Error Handling (Try-Except)",
    content: `# Error Handling\n\nThe \`try\` block lets you test a block of code for errors.\nThe \`except\` block lets you handle the error.\nThe \`finally\` block lets you execute code, regardless of the result of the try- and except blocks.\n\n## Code Example\n\`\`\`python\ntry:\n  print(x)\nexcept NameError:\n  print("Variable x is not defined")\nexcept:\n  print("Something else went wrong")\nfinally:\n  print("The 'try except' is finished")\n\`\`\``
  },
  {
    title: "File Handling",
    content: `# File Handling\n\nFile handling is an important part of any web application. Python has several functions for creating, reading, updating, and deleting files.\n\n## Open Function\nThe key function for working with files in Python is the \`open()\` function. It takes two parameters: filename and mode.\n\n## Code Example\n\`\`\`python\n# Reading a file\nf = open("demofile.txt", "r")\nprint(f.read())\n\n# Writing to a file\nf = open("demofile2.txt", "a")\nf.write("Now the file has more content!")\nf.close()\n\`\`\``
  },
  {
    title: "Classes & Objects (OOP)",
    content: `# Classes & Objects\n\nPython is an object oriented programming language. Almost everything in Python is an object, with its properties and methods.\n\n## Classes\nA Class is like an object constructor, or a "blueprint" for creating objects.\n\n## Code Example\n\`\`\`python\nclass Person:\n  def __init__(self, name, age):\n    self.name = name\n    self.age = age\n\n  def greet(self):\n    print("Hello my name is " + self.name)\n\np1 = Person("John", 36)\np1.greet()\n\`\`\``
  },
  {
    title: "Modules & Packages",
    content: `# Modules & Packages\n\nConsider a module to be the same as a code library. A file containing a set of functions you want to include in your application.\n\n## Importing Modules\nYou can use any Python source file as a module by executing an \`import\` statement in some other Python source file.\n\n## Code Example\n\`\`\`python\nimport math\n\nx = math.sqrt(64)\nprint(x)\n\nimport datetime\n\nx = datetime.datetime.now()\nprint(x)\n\`\`\``
  },
  {
    title: "List Comprehensions",
    content: `# List Comprehensions\n\nList comprehension offers a shorter syntax when you want to create a new list based on the values of an existing list.\n\n## Syntax\n\`newlist = [expression for item in iterable if condition == True]\`\n\n## Code Example\n\`\`\`python\nfruits = ["apple", "banana", "cherry", "kiwi", "mango"]\n\n# Without list comprehension\nnewlist = []\nfor x in fruits:\n  if "a" in x:\n    newlist.append(x)\n\n# With list comprehension\nnewlist = [x for x in fruits if "a" in x]\n\`\`\``
  },
  {
    title: "Lambda Functions",
    content: `# Lambda Functions\n\nA lambda function is a small anonymous function. A lambda function can take any number of arguments, but can only have one expression.\n\n## Syntax\n\`lambda arguments : expression\`\n\n## Code Example\n\`\`\`python\nx = lambda a : a + 10\nprint(x(5))\n\nx = lambda a, b, c : a + b + c\nprint(x(5, 6, 2))\n\`\`\``
  },
  {
    title: "Decorators",
    content: `# Decorators\n\nDecorators are a very powerful and useful tool in Python since it allows programmers to modify the behaviour of a function or class.\n\n## Usage\nDecorators are usually called before the definition of a function you want to decorate.\n\n## Code Example\n\`\`\`python\ndef my_decorator(func):\n    def wrapper():\n        print("Something is happening before the function is called.")\n        func()\n        print("Something is happening after the function is called.")\n    return wrapper\n\n@my_decorator\ndef say_whee():\n    print("Whee!")\n\nsay_whee()\n\`\`\``
  },
  {
    title: "Generators",
    content: `# Generators\n\nGenerators are iterators, a kind of iterable you can only iterate over once. Generators do not store all the values in memory, they generate the values on the fly.\n\n## Yield\nGenerators are written like regular functions but use the \`yield\` statement whenever they want to return data.\n\n## Code Example\n\`\`\`python\ndef my_generator():\n    yield 1\n    yield 2\n    yield 3\n\nfor item in my_generator():\n    print(item)\n\`\`\``
  },
  {
    title: "Regular Expressions (Regex)",
    content: `# Regular Expressions\n\nA RegEx, or Regular Expression, is a sequence of characters that forms a search pattern. RegEx can be used to check if a string contains the specified search pattern.\n\n## Python \`re\` Module\nPython has a built-in package called \`re\`, which can be used to work with Regular Expressions.\n\n## Code Example\n\`\`\`python\nimport re\n\ntxt = "The rain in Spain"\nx = re.search("^The.*Spain$", txt)\n\nif x:\n  print("YES! We have a match!")\nelse:\n  print("No match")\n\`\`\``
  },
  {
    title: "Virtual Environments",
    content: `# Virtual Environments\n\nA virtual environment is a tool that helps to keep dependencies required by different projects separate by creating isolated python virtual environments for them.\n\n## Why use them?\nIt prevents conflicts between package versions across different projects.\n\n## Code Example\n\`\`\`bash\n# Create a virtual environment\npython -m venv myenv\n\n# Activate (Windows)\nmyenv\\\\Scripts\\\\activate\n\n# Activate (Mac/Linux)\nsource myenv/bin/activate\n\`\`\``
  },
  {
    title: "APIs & Requests",
    content: `# APIs & Requests\n\nThe \`requests\` module allows you to send HTTP requests using Python. The HTTP request returns a Response Object with all the response data (content, encoding, status, etc).\n\n## Usage\nYou must first install the requests module: \`pip install requests\`\n\n## Code Example\n\`\`\`python\nimport requests\n\nx = requests.get('https://w3schools.com/python/demopage.htm')\n\nprint(x.text)\n\`\`\``
  },
  {
    title: "Web Scraping with BeautifulSoup",
    content: `# Web Scraping\n\nBeautiful Soup is a library that makes it easy to scrape information from web pages. It sits atop an HTML or XML parser, providing Pythonic idioms for iterating, searching, and modifying the parse tree.\n\n## Usage\nInstall via pip: \`pip install beautifulsoup4\`\n\n## Code Example\n\`\`\`python\nfrom bs4 import BeautifulSoup\nimport requests\n\nhtml_doc = requests.get('https://example.com').text\nsoup = BeautifulSoup(html_doc, 'html.parser')\n\nprint(soup.title.string)\n\`\`\``
  }
];

export async function GET() {
  const allCourses = await prisma.course.findMany({
    include: { modules: { include: { lessons: true }, orderBy: { order: 'asc' } } }
  });
  
  const course = allCourses.find(c => c.title === 'Python' || c.title === 'python');
  
  if (!course) {
    return NextResponse.json({ error: 'no course', allCourseTitles: allCourses.map(c => c.title) });
  }

  let updatedCount = 0;
  for (let i = 1; i < course.modules.length; i++) {
    const mod = course.modules[i];
    const defaultTopic = { title: 'Advanced Python ' + i, content: '# Advanced Python ' + i + '\\n\\nContent for this section.\\n\\n```python\\nprint("Hello")\\n```' };
    const topic = topics[i - 1] || defaultTopic;
    
    await prisma.module.update({
      where: { id: mod.id },
      data: { title: topic.title }
    });

    if (mod.lessons.length === 0) {
      await prisma.lesson.create({
        data: {
          title: topic.title,
          notes: topic.content,
          moduleId: mod.id,
          order: 0
        }
      });
    } else {
      await prisma.lesson.update({
        where: { id: mod.lessons[0].id },
        data: {
          title: topic.title,
          notes: topic.content,
        }
      });
    }
    updatedCount++;
  }

  return NextResponse.json({ success: true, count: updatedCount, courseTitle: course.title, totalModules: course.modules.length });
}
