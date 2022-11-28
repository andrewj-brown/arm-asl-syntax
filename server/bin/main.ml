let rec loop n =
  print_endline (read_line ()); loop n


let () = print_endline ""; loop ()