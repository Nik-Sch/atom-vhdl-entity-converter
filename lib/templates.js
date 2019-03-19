"use babel"
// Copyright (C) 2016 Pete Burgers
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.

export const DEFAULT_OPTIONS = {signalPrefix: "", indentType: "", indentSpaceCount: 0}

function componentTemplate(entity, options = DEFAULT_OPTIONS) {
  let text = `component ${entity.name}\n`
  const indentString = getIndentString(options.indentType, options.indentSpaceCount)
  if (entity.generics.length > 0) {
    text += `generic (\n`
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      text += `${indentString}${name} : ${generic.type}`
      if (generic.default) {
        text += ` := ${generic.default}`
      }
      text += `;\n`
    }
    // Strip the final semicolon
    text = text.slice(0, -2)
    text += `\n);\n`
  }

  if (entity.ports.length > 0) {
    text += `port (\n`
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      const dir = rpad(port.dir, 3)
      text += `${indentString}${name} : ${dir} ${port.type};\n`
    }
    // Strip the final semicolon
    text = text.slice(0, -2)
    text += `\n);\n`
  }

  text += `end component ${entity.name};\n`
  return text
}

function instanceTemplate(entity, options = DEFAULT_OPTIONS) {
  let text = `inst_${entity.name} : entity work.${entity.name}`
  const indentString = getIndentString(options.indentType, options.indentSpaceCount)
  if (entity.generics.length > 0) {
    text += `\ngeneric map (\n`
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      text += `${indentString}${name} => ${generic.name},\n`
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n)`
  }

  if (entity.ports.length > 0) {
    text += `\nport map (\n`
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      text += `${indentString}${name} => ${options.signalPrefix}${port.name},\n`
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n)`
  }

  text += `;\n`
  return text
}

  // lfsr #(
  //     .g_LFSR_WIDTH(LFSR_WIDTH)
  //   ) i_dut (
  //    .i_clk         (clk),
  //    .i_reset       (reset),
  //    .i_enable      (dut_i_enable),
  //    .o_lfsr        (dut_o_lfsr)
  //    );
function sysVerilogTemplate(entity, options = DEFAULT_OPTIONS) {
  let text = entity.name;
  const indentString = getIndentString(options.indentType, options.indentSpaceCount)
  if (entity.generics.length > 0) {
    text += ` #(\n`
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      text += `${indentString}.${name}(dut_${generic.name}),\n`
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n)`
  }

  if (entity.ports.length > 0) {
    text += ` i_dut (\n`
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      text += `${indentString}.${name}(dut_${options.signalPrefix}${port.name}),\n`
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n)`
  }

  text += `;\n`
  return text
}

function signalsTemplate(entity, options = DEFAULT_OPTIONS) {
  let text = ""
  if (entity.ports.length > 0) {
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      text += `signal ${options.signalPrefix}${name} : ${port.type};\n`
    }
  }
  return text
}

function longestinArray(array, attr) {
  let longest = 0
  for (let object of array) {
    if (object[attr].length > longest) {
      longest = object.name.length
    }
  }
  return longest
}

function rpad(string, length, padChar = " ") {
  while (string.length < length) {
    string = string + padChar
  }
  return string
}

function getIndentString(type, count)
{
  if (type == 'Tabs') {
    return '\t'
  } else if (type == 'Spaces') {
    return ' '.repeat(count)
  } else {
    return '  ' // default fallback
  }
}

export {
  componentTemplate,
  instanceTemplate,
  signalsTemplate,
  sysVerilogTemplate
}
